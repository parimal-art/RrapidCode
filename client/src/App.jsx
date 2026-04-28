import { Navigate, Route, Routes } from "react-router";
import SignUp from "./pages/signup.jsx";
import Login from "./pages/login.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authslice.js";
import Homepage from "./pages/homepage.jsx";
import ProblemPage from "./pages/codeEditor.jsx";
import Admin from './pages/admin.jsx';
import AdminCreate from "./components/admincreate.jsx";
import AdminDelete from "./components/admindelete.jsx";
import AdminVideo from "./components/adminvideo.jsx";
import AdminUpdate from "./components/adminupdate.jsx";
import AdminUpload from "./components/uploadvideo.jsx";

// ── Simple Profile placeholder page ──────────────────────────────────────────
// Replace this with your real Profile component once you build it.
function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060712] via-[#071023] to-[#05060a] text-slate-100 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
        <h1 className="text-3xl font-bold text-cyan-300 mb-2">Profile</h1>
        <p className="text-slate-400">Your profile page is coming soon.</p>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function App(){
  
    const {isAuthenticated, loading, user} = useSelector((state)=>state.auth);
     console.log(user);
    const dispatch = useDispatch();
     useEffect(()=>{
       dispatch(checkAuth());
     },[dispatch]);
     
    if(loading){
      return <div className="min-h-screen flex items-center justify-center">
  <span className="loading loading-spinner loading-lg"></span>
      </div>;
    }

  return (<>
    <Routes>
       <Route path="/" element={ isAuthenticated ? <Homepage/> :<Navigate to="/signup"/>}></Route>
       <Route path="/login" element={isAuthenticated ? <Navigate to="/"/>:<Login/>}></Route>
       <Route path="/signup" element={isAuthenticated ? <Navigate to="/"/> : <SignUp/>}></Route>

       {/* ── FIX 1: /profile route was missing — caused "No routes matched" error ── */}
       <Route path="/profile" element={isAuthenticated ? <ProfilePage/> : <Navigate to="/signup"/>}></Route>

       <Route path="problem/:problemId" element={isAuthenticated ? <ProblemPage/> : <Navigate to="/signup"/>} ></Route>

       {/* admin Panel Details */}

       {/* 1. Go to admin Panel */}
      {user && (
            <Route
          path="/admin"
        element={ isAuthenticated && user?.role === 'admin' ? ( <Admin />) : (<Navigate to="/" />)}></Route>)}

        {/* 2. Create Problem */}
         {user && (
            <Route
          path="/admin/create"
        element={ isAuthenticated && user?.role === 'admin' ? ( <AdminCreate />) : (<Navigate to="/" />)}></Route>)}
         
        {/* 3. Update Problem */}
        {user && (
            <Route
          path="/admin/update"
        element={ isAuthenticated && user?.role === 'admin' ? ( <AdminUpdate />) : (<Navigate to="/" />)}></Route>)}
         
        {/* 4. Delete Problem */}
        {user && (
            <Route
          path="/admin/delete"
        element={ isAuthenticated && user?.role === 'admin' ? ( <AdminDelete />) : (<Navigate to="/" />)}></Route>)}

       <Route path="/admin/video" element={isAuthenticated && user.role ==='admin' ? <AdminVideo/> : <Navigate to="/" />}></Route>

       <Route path="/admin/upload/:problemId" element={isAuthenticated && user.role ==='admin' ? <AdminUpload/> : <Navigate to="/" />}></Route>


    </Routes>

  </>)
}