import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/AdminLayout";
import { ArrowLeft, Download, Search, CheckCircle, XCircle, Clock, Mail, User, ThumbsUp, ThumbsDown, Ban, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { authFetch } from "../../lib/authFetch";
import { BACKEND_URL } from "../../config";

const AdminMeetupRegistrations = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [meetup, setMeetup] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Meetup Details
            const { data: meetupData, error: meetupError } = await supabase
                .from("meetup")
                .select("title, start_date_time, venue")
                .eq("id", id)
                .single();

            if (meetupError) throw meetupError;
            setMeetup(meetupData);

            // 2. Fetch Registrations
            // We join with users table to get details if user_id is present
            // Note: Supabase join syntax: table (columns)
            const { data: regData, error: regError } = await supabase
                .from("registrations")
                .select(`
                    *,
                    users (
                        display_name,
                        email,
                        avatar
                    )
                `)
                .eq("meetup_id", id)
                .order("created_at", { ascending: false });

            if (regError) throw regError;
            setRegistrations(regData);

        } catch (err) {
            console.error("Error fetching data:", err);
            toast.error("Failed to load registrations");
        } finally {
            setLoading(false);
        }
    };

    // Filter registrations
    const filteredRegistrations = registrations.filter(reg => {
        const searchLower = searchTerm.toLowerCase();
        const userName = reg.user_name || reg.users?.display_name || "Unknown";
        const email = reg.email || reg.users?.email || "";
        const token = reg.token || "";

        return (
            userName.toLowerCase().includes(searchLower) ||
            email.toLowerCase().includes(searchLower) ||
            token.toLowerCase().includes(searchLower)
        );
    });

    // Handle Approve Registration
    const handleApprove = async (regId) => {
        // Find the registration to get details for email
        const reg = registrations.find(r => r.id === regId);
        if (!reg) return;

        try {
            const { error } = await supabase
                .from("registrations")
                .update({ status: "approved" })
                .eq("id", regId);

            if (error) throw error;

            setRegistrations(prev =>
                prev.map(r => r.id === regId ? { ...r, status: "approved" } : r)
            );

            // Send approval email with QR code
            const email = reg.user_email || reg.email || reg.users?.email;
            const userName = reg.user_name || reg.users?.display_name || "Attendee";

            if (email && meetup) {
                try {
                    await authFetch(`${BACKEND_URL}/send-approval-email`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email,
                            userName,
                            meetupTitle: meetup.title,
                            meetupDate: new Date(meetup.start_date_time).toLocaleString(),
                            meetupVenue: meetup.venue || "TBA",
                            token: reg.token,
                        }),
                    });
                    toast.success(`Approved & email sent to ${email}`);
                } catch (emailErr) {
                    console.error("Email send error:", emailErr);
                    toast.success("Approved! (Email failed to send)");
                }
            } else {
                toast.success("Registration approved!");
            }
        } catch (err) {
            console.error("Error approving:", err);
            toast.error("Failed to approve registration");
        }
    };

    // Handle Reject Registration
    const handleReject = async (regId) => {
        try {
            const { error } = await supabase
                .from("registrations")
                .update({ status: "rejected" })
                .eq("id", regId);

            if (error) throw error;

            setRegistrations(prev =>
                prev.map(r => r.id === regId ? { ...r, status: "rejected" } : r)
            );
            toast.success("Registration rejected");
        } catch (err) {
            console.error("Error rejecting:", err);
            toast.error("Failed to reject registration");
        }
    };

    const exportCSV = () => {
        if (!registrations.length) return;

        const headers = ["Name", "Email", "Token", "Checked In", "Check-in Time", "Registration Date"];
        const csvRows = [headers.join(",")];

        registrations.forEach(reg => {
            const name = reg.user_name || reg.users?.display_name || "Unknown";
            const email = reg.email || reg.users?.email || "N/A";
            const token = reg.token || "";
            const checkedIn = reg.is_checked_in ? "Yes" : "No";
            const checkInTime = reg.checked_in_at ? new Date(reg.checked_in_at).toLocaleString() : "-";
            const regDate = new Date(reg.created_at).toLocaleDateString();

            const row = [
                `"${name}"`,
                `"${email}"`,
                `"${token}"`,
                checkedIn,
                `"${checkInTime}"`,
                `"${regDate}"`
            ];
            csvRows.push(row.join(","));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `registrations_${meetup?.title || id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminLayout>
            <Toaster position="top-center" />
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/admin/meetups")}
                            className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                                {loading ? "Loading..." : `Registrations: ${meetup?.title}`}
                            </h1>
                            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-semibold">
                                    {registrations.length} Total
                                </span>
                                {meetup && (
                                    <>
                                        <span>•</span>
                                        <span>{new Date(meetup.start_date_time).toLocaleDateString()}</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or token..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm"
                            />
                        </div>
                        <button
                            onClick={exportCSV}
                            disabled={loading || registrations.length === 0}
                            className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    <th className="px-6 py-4">Attendee</th>
                                    <th className="px-6 py-4">Token</th>
                                    <th className="px-6 py-4">Approval</th>
                                    <th className="px-6 py-4">Check-in</th>
                                    <th className="px-6 py-4">Registered At</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            Loading registrations...
                                        </td>
                                    </tr>
                                ) : filteredRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            {searchTerm ? "No matches found" : "No one has registered yet"}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRegistrations.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                        {(reg.user_name || reg.users?.display_name || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 text-sm">
                                                            {reg.user_name || reg.users?.display_name || "Unknown User"}
                                                        </div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {reg.email || reg.users?.email || "No email"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                    {reg.token}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {reg.status === "approved" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Approved
                                                    </span>
                                                ) : reg.status === "rejected" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                        <Ban className="w-3.5 h-3.5" /> Rejected
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                                        <Clock className="w-3.5 h-3.5" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {reg.is_checked_in ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Yes
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(reg.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {reg.status !== "approved" && (
                                                        <button
                                                            onClick={() => handleApprove(reg.id)}
                                                            className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <ThumbsUp className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {reg.status !== "rejected" && (
                                                        <button
                                                            onClick={() => handleReject(reg.id)}
                                                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <ThumbsDown className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminMeetupRegistrations;
