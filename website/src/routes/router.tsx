import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    Navigate,
} from "react-router-dom";
import AuthGuard from "@/components/common/AuthGuard";
import LoginPage from "@/pages/auth/LoginPage";
import MainLayout from "@/layout/MainLayout";
import DocumentPage from "@/pages/documents/DocumentPage";
import ProfilePage from '@/pages/profile/ProfilePage'
import NotificationsPage from '@/pages/notifications/NotificationsPage'
import AllUser from "@/pages/users/AllUser";
import Approver from "@/pages/home/Approver";
import Assitant from "@/pages/home/Assitant";
import Admin from "@/pages/home/Admin";

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            {/* Public route */}
            <Route path="/auth" element={<LoginPage />} />

            {/* Protected routes */}
            <Route element={<AuthGuard />}>
                <Route element={<MainLayout />}>
                    {/* Document status routes */}
                    <Route path="/pending" element={<DocumentPage status="pending" />} />
                    <Route path="/approved" element={<DocumentPage status="approved" />} />
                    <Route path="/rejected" element={<DocumentPage status="rejected" />} />
                    <Route path="/correction" element={<DocumentPage status="correction" />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    
                    {/* Role-specific dashboard routes (role-guarded) */}
                    <Route element={<AuthGuard roles={["assistant"]} />}>
                        <Route path="/assistant-home" element={<Assitant />} />
                    </Route>
                    <Route element={<AuthGuard roles={["admin"]} />}>
                        <Route path="/admin-home" element={<Admin/>} />
                        <Route path="/admin/create-user" element={<h1>Create User</h1>} />
                    </Route>
                    <Route element={<AuthGuard roles={["approver"]} />}>
                        <Route path="/approver-home" element={<Approver />} />
                    </Route>

                    <Route element={<AuthGuard roles={["admin", "approver"]} />}>
                        <Route path="/users" element={<AllUser />} />
                    </Route>
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
        </>
    )
);

export default router;