import { supabase } from "./supabaseClient";


const fetchId = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log(session?.user.id)
    // setUserIdState(session?.user.id || null);
    return session?.user.id;
  }
export { fetchId };
