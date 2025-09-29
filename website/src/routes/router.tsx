// ...existing code... (no React helpers needed here)
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    Navigate,
} from 'react-router-dom'
import AuthGuard from '@/components/common/AuthGuard'
import LoginPage from '@/pages/auth/LoginPage'

const Home = () => <div>Home</div>
const ApproverDashboard = () => <div>Approver Dashboard</div>
const AssistantDashboard = () => <div>Assistant Dashboard</div>
const AdminDashboard = () => <div>Admin Dashboard</div>

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            {/* Public routes */}
            <Route path="/auth" element={<LoginPage />} />

            {/* Protected routes - user must be authenticated */}
            <Route element={<AuthGuard />}>
                {/* Generic home accessible to any logged-in user */}
                <Route path="/" element={<Home />} />

                {/* Role specific routes */}
                <Route element={<AuthGuard roles={["approver"]} />}>
                    <Route path="/approver" element={<ApproverDashboard />} />
                </Route>

                <Route element={<AuthGuard roles={["assistant"]} />}>
                    <Route path="/assistant" element={<AssistantDashboard />} />
                </Route>

                <Route element={<AuthGuard roles={["admin"]} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                </Route>
            </Route>

            {/* Fallback: if path not matched, redirect to auth or home depending on auth state.
                    This will be handled by application logic; for unknown paths we'll send to /auth */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
        </>
    )
)

export default router