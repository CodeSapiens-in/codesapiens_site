# Contribution Guidelines

Thank you for your interest in contributing to our project! We welcome contributions from everyone.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/codesapiens_site.git
    cd codesapiens_site
    ```
3.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/your-feature-name
    ```

## Development Workflow

1.  Make your changes in the codebase.
2.  Ensure your code follows the existing style and conventions.
3.  Test your changes locally to ensure they work as expected.

### ⚠️ Important: Database Modifications

If you make **ANY** modification to the database schema (e.g., adding tables, columns, or changing constraints), you **MUST** update the `seed.sql` file to reflect these changes.

*   **File Path:** `seed.sql`
*   **Action:** Add the corresponding SQL commands to recreate the schema changes in `seed.sql`.
*   **Reason:** This ensures that new environments can be initialized with the correct database structure.

## Submitting a Pull Request

1.  **Commit your changes** with a clear and descriptive message.
    ```bash
    git commit -m "feat: add new amazing feature"
    ```
2.  **Push to your fork**:
    ```bash
    git push origin feature/your-feature-name
    ```
3.  **Open a Pull Request** on the original repository.
4.  Describe your changes in detail and reference any related issues.

## Code of Conduct

Please note that this project is released with a Code of Conduct. By participating in this project, you agree to abide by its terms.

Happy Coding! 🚀
