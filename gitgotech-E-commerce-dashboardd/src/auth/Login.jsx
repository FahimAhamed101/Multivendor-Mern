import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined, LockOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserLoginMutation } from '../redux/features/authSlice/authSlice';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [userLogin] = useUserLoginMutation();

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const res = await userLogin(values).unwrap();
      console.log('Login response:', res);

      if (res?.status === 200) {
        // Store authentication data
        localStorage.setItem('userRole', res?.data?.user?.role);
        localStorage.setItem('user', JSON.stringify(res?.data?.user));
        localStorage.setItem('userEmail', values.email);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token', res?.data?.token);

        // Role-based navigation
        const role = res?.data?.user?.role;

        if (role === 'admin') {
          navigate('/dashboard/home');
          message.success('Welcome back, Admin!');
        } else if (role === 'manager') {
          navigate('/dashboard/requested');
          message.success('Welcome back, Manager!');
        } else if (role === 'support') {
          navigate('/dashboard/requested');
          message.success('Welcome back!');
        } else {
          // Default fallback for other roles
          navigate('/dashboard/requested');
          message.success('Welcome back!');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/image/authbg.png)',
        }}
      >
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-[600px] px-6">
        {/* Logo */}
        <div className="text-center flex items-center justify-center mb-4">
          <img src="/image/logo.png" className='h-32 w-32' alt="Logo" />
        </div>

        {/* Form Card */}
        <div className="bg-[#0A0A09]/70 backdrop-blur-[4px] rounded-2xl shadow-2xl border border-purple-400/40 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2 font-cormorant">Welcome back to Sleeknit</h2>
            <p className="text-gray-400 text-sm">Please enter your credentials to continue.</p>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            className="space-y-1"
          >
            {/* Email Field */}
            <Form.Item
              label={<span className="text-white font-medium">Email Address</span>}
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<MailOutlined className="!text-purple-400" />}
                placeholder="Enter Your Email"
                className="h-12 !bg-[#242428] rounded-lg !placeholder-gray-500"
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              label={<span className="text-white font-medium">Password</span>}
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
              className="mb-2"
            >
              <Input.Password
                prefix={<LockOutlined className="!text-purple-400" />}
                placeholder="Enter Your Password"
                iconRender={(visible) => (visible ? <EyeOutlined className="!text-blue-50" /> : <EyeInvisibleOutlined className="!text-blue-50" />)}
                className="h-12 !bg-[#242428] rounded-lg"
              />
            </Form.Item>

            {/* Forgot Password Link */}
            <div className="text-right mb-6">
              <a href="/forgotpassword" className="text-purple-400 text-sm hover:text-purple-300 transition-colors">
                Forgot Password?
              </a>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {/* Sign In Button */}
            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full !h-12 text-base font-semibold rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
                style={{
                  background: '#6100FF',
                  border: 'none',
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Custom Styles for Ant Design Components */}
      <style>{`
        .ant-form-item-label > label {
          color: white !important;
        }

        .ant-input-affix-wrapper {
          background-color: rgba(31, 41, 55, 0.5) !important;
          border-color: #374151 !important;
        }

        .ant-input-affix-wrapper:hover,
        .ant-input-affix-wrapper-focused {
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.1) !important;
        }

        .ant-input {
          background-color: transparent !important;
          color: white !important;
        }

        .ant-input::placeholder {
          color: #6b7280 !important;
        }

        .ant-input-suffix {
          color: #9ca3af !important;
        }

        .ant-form-item-explain-error {
          color: #ef4444 !important;
        }

        .ant-select-selector {
          background-color: #242428 !important;
          border-color: #374151 !important;
          color: white !important;
          height: 48px !important;
          padding: 8px 12px !important;
        }

        .ant-select-selector:hover {
          border-color: #a855f7 !important;
        }

        .ant-select-focused .ant-select-selector {
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.1) !important;
        }

        .ant-select-selection-item {
          color: white !important;
          line-height: 32px !important;
        }

        .ant-select-arrow {
          color: #9ca3af !important;
        }

        .ant-select-dropdown {
          background-color: #1f2937 !important;
          border: 1px solid #374151 !important;
        }

        .ant-select-item {
          color: white !important;
        }

        .ant-select-item-option-selected {
          background-color: rgba(168, 85, 247, 0.2) !important;
        }

        .ant-select-item-option-active {
          background-color: rgba(168, 85, 247, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default Login;
