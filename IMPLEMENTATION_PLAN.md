# Fix Registration Error

The user reported an error when registering. The issue is caused by:
1.  `AuthContext.signup` uses a secondary Firebase app (intended for admins) which doesn't log the user in.
2.  `firestore.rules` prevents non-superadmins from creating user profiles.
3.  `RegisterPage` expects the user to be logged in after registration.

## Proposed Changes

### 1. Update `AuthContext.jsx`
-   Rename `signup` to `createUserByAdmin(email, password, nombre, rol)`.
    -   Update it to accept `rol` (fixing the bug where admin selection was ignored).
-   Add `registerSelf(email, password, nombre)`.
    -   Use `createUserWithEmailAndPassword(auth, ...)` (main instance).
    -   Write profile to Firestore with default role "juez".

### 2. Update `firestore.rules`
-   Allow `create` on `usuarios/{userId}` if `request.auth.uid == userId`.
-   Ensure users cannot set their own role to 'superadmin' (validate `request.resource.data.rol`).

### 3. Update Components
-   **`RegisterPage.jsx`**: Call `registerSelf` instead of `signup`.
-   **`CreateUserModal.jsx`**: Call `createUserByAdmin` instead of `signup`.

## Verification Plan

### Manual Verification
-   Go to `/register`.
-   Register a new user.
-   Verify redirection to home page (or dashboard).
-   Verify user document created in Firestore with role "juez".
-   Log in as Superadmin.
-   Create a new user via "Gestionar Usuarios".
-   Verify user created with selected role.
