import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Login.module.css';
import axios from 'axios';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const onSubmit = async (data) => {
        setLoading(true);

        try {
            // API Call
            // NOTE: Replace '/auth/login' with your actual endpoint
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/login`, {
                email: data.email,
                password: data.password
            });

            console.log('Login Success:', response.data);

            // Store in LocalStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.admin));
            }

            toast.success("Login successful");
            router.push('/');
        } catch (error) {
            console.error('Login Failed:', error);

            const msg = error.response?.data?.message || 'Access Denied. Please check your credentials.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Login | SPOT-IT Administration</title>
            </Head>

            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logoWrapper}>
                        <Image
                            src="/spot-it-logo.png"
                            alt="SPOT-IT Logo"
                            width={180}
                            height={40}
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>
                    <h1 className={styles.title}>SPOT-IT Admin</h1>
                    <p className={styles.subtitle}>Swachh Bharat Mission Initiative • Government of India</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input
                                type="email"
                                className={styles.input}
                                placeholder="official@admin.gov.in"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Please enter a valid official email"
                                    }
                                })}
                            />
                        </div>
                        {errors.email && <span className={styles.error}>{errors.email.message}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Secure Password</label>
                        <div className={styles.inputWrapper} style={{ position: 'relative' }}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className={styles.input}
                                placeholder="••••••••••••"
                                {...register("password", {
                                    required: "Password is required"
                                })}
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#64748b', // Adjust color to match theme / text-secondary
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: 0
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <span className={styles.error}>{errors.password.message}</span>}
                    </div>

                    <button type="submit" className={styles.loginBtn} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" style={{ marginRight: '0.5rem' }} />
                                Verifying Credentials...
                            </>
                        ) : (
                            'Access Dashboard'
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Login;
