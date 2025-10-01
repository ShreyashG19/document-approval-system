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
                    <Route path="/remarked" element={<DocumentPage status="remarked" />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    
                    {/* Role-specific dashboard routes (role-guarded) */}
                    <Route element={<AuthGuard roles={["assistant"]} />}>
                        <Route path="/assistant" element={<DocumentPage status="pending" />} />
                    </Route>
                    <Route element={<AuthGuard roles={["admin"]} />}>
                        <Route path="/admin" element={<DocumentPage status="pending" />} />
                    </Route>
                    <Route element={<AuthGuard roles={["approver"]} />}>
                        <Route path="/approver" element={<DocumentPage status="pending" />} />
                    </Route>
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
        </>
    )
);

export default router;