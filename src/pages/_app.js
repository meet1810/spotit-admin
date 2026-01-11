import "@/styles/globals.css";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Loader from '../components/Common/Loader';
import { ToastContainer, toast } from 'react-toastify';
import { io } from 'socket.io-client';
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // List of public paths that don't require auth
    const publicPaths = ['/login', '/_error'];
    const path = router.pathname;

    const verifyToken = async () => {
      // If we are on a public path, we don't need to verify token strictly, 
      // but if user is already logged in, we might want to redirect to dashboard?
      // For now, let's just allow public paths.
      if (publicPaths.includes(path)) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        setLoading(false);
        return;
      }

      try {
        // CALL VERIFY API
        await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/verify`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // If success, user is valid.
        setLoading(false);
      } catch (error) {
        console.error("Token verification failed:", error);
        // Invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        router.push('/login');
        setLoading(false);
      }
    };

    verifyToken();
  }, [router.pathname]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL);

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('notification', (data) => {
      console.log('Notification received:', data);
      const message = typeof data === 'string' ? data : (data?.message || JSON.stringify(data));
      toast.info(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return <Loader fullScreen text="Verifying Session..." />;
  }

  return (
    <>
      <Component {...pageProps} />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
    </>
  );
}
