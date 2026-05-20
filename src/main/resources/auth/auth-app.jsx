import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { getSupabaseConfig } from "./supabase-client";

const STATUS_EMPTY = { message: "", success: true };
const DEFAULT_LOGIN_FORM = { identity: "", password: "" };
const DEFAULT_REGISTER_FORM = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[!@#\$%\^&\*\(\)_\+\-=\[\]\{\};':"\\|,.<>\/?]).{8,}$/;

function AuthApp() {
  const [mode, setMode] = useState("login");
  const [title, setTitle] = useState("");
  const [supabaseConfigured] = useState(() => getSupabaseConfig().configured);
  const [bridgeReady, setBridgeReady] = useState(
    Boolean(window.__javaBridgeReady && window.javaBridge)
  );
  const [loginForm, setLoginForm] = useState(DEFAULT_LOGIN_FORM);
  const [registerForm, setRegisterForm] = useState(DEFAULT_REGISTER_FORM);
  const [loginStatus, setLoginStatus] = useState(STATUS_EMPTY);
  const [registerStatus, setRegisterStatus] = useState(STATUS_EMPTY);
  const registerSuccessTimeoutRef = useRef(null);

  useEffect(() => {
    const fullText = "HỆ THỐNG AI-QUIZ";
    let index = 0;

    const typingTimer = window.setInterval(() => {
      index += 1;
      setTitle(fullText.slice(0, index));
      if (index >= fullText.length) {
        window.clearInterval(typingTimer);
      }
    }, 40);

    const authCard = document.getElementById("authCard");
    if (authCard) {
      authCard.style.visibility = "visible";
      authCard.style.opacity = "1";
      authCard.classList.add("app-mounted");
    }

    if (window.particlesJS) {
      try {
        window.particlesJS("particles-js", {
          particles: {
            number: { value: 60, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.3 },
            size: { value: 3, random: true },
            line_linked: {
              enable: true,
              distance: 150,
              color: "#ffffff",
              opacity: 0.2,
              width: 1,
            },
            move: { enable: true, speed: 2 },
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: { enable: true, mode: "grab" },
              onclick: { enable: true, mode: "push" },
            },
            modes: { grab: { distance: 140, line_linked: { opacity: 0.5 } } },
          },
          retina_detect: true,
        });
      } catch (error) {
        console.warn("particlesJS init failed", error);
      }
    }

    if (window.gsap) {
      try {
        window.gsap.set("#authCard", { autoAlpha: 1 });
        window.gsap.from("#authCard", {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "back.out(1.2)",
        });
        window.gsap.fromTo(
          ".fade-up-element",
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: "power2.out",
            delay: 0.15,
          }
        );
      } catch (error) {
        console.warn("GSAP init failed", error);
      }
    }

    if (!supabaseConfigured) {
      console.warn(
        "Supabase env is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before using Supabase features."
      );
    }

    return () => {
      window.clearInterval(typingTimer);
      if (registerSuccessTimeoutRef.current) {
        window.clearTimeout(registerSuccessTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleBridgeReady = () => {
      setBridgeReady(Boolean(window.javaBridge));
    };

    window.addEventListener("java-bridge-ready", handleBridgeReady);
    handleBridgeReady();

    window.showLoginStatus = (message, success) => {
      setLoginStatus({ message: message || "", success: success !== false });
    };

    window.showRegisterStatus = (message, success) => {
      setRegisterStatus({ message: message || "", success: success !== false });
    };

    window.prefillLoginIdentity = (value) => {
      setLoginForm((current) => ({
        ...current,
        identity: value || "",
        password: "",
      }));
    };

    window.clearAuthForms = () => {
      setLoginForm(DEFAULT_LOGIN_FORM);
      setRegisterForm(DEFAULT_REGISTER_FORM);
    };

    window.showLoginForm = () => {
      setMode("login");
    };

    window.handleRegisterSuccess = (message, loginIdentity) => {
      const safeMessage = message || "Đăng ký thành công.";
      setRegisterStatus({ message: safeMessage, success: true });
      setLoginForm((current) => ({
        ...current,
        identity: loginIdentity || "",
        password: "",
      }));
      setRegisterForm(DEFAULT_REGISTER_FORM);

      if (registerSuccessTimeoutRef.current) {
        window.clearTimeout(registerSuccessTimeoutRef.current);
      }

      registerSuccessTimeoutRef.current = window.setTimeout(() => {
        setMode("login");
        setLoginStatus({
          message: safeMessage + " Vui lòng đăng nhập bằng tài khoản vừa tạo.",
          success: true,
        });
        setRegisterStatus(STATUS_EMPTY);
      }, 900);
    };

    return () => {
      window.removeEventListener("java-bridge-ready", handleBridgeReady);
      delete window.showLoginStatus;
      delete window.showRegisterStatus;
      delete window.prefillLoginIdentity;
      delete window.clearAuthForms;
      delete window.showLoginForm;
      delete window.handleRegisterSuccess;
    };
  }, []);

  function statusClass(status) {
    const classes = ["status-text", "fade-up-element"];
    if (status.message) {
      classes.push(status.success ? "success" : "error", "visible");
    }
    return classes.join(" ");
  }

  function iconColor(value, isValid) {
    if (!value) {
      return "var(--text-gray)";
    }
    return isValid ? "#4CAF50" : "#f44336";
  }

  const isNameValid = registerForm.fullName.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email);
  const isPasswordValid = PASSWORD_REGEX.test(registerForm.password);
  const isConfirmValid =
    registerForm.confirmPassword !== "" &&
    registerForm.confirmPassword === registerForm.password;

  function handleLoginSubmit(event) {
    event.preventDefault();
    if (!bridgeReady) {
      setLoginStatus({
        message: "Ứng dụng Java chưa sẵn sàng. Vui lòng đợi 1 giây rồi thử lại.",
        success: false,
      });
      return;
    }
    if (window.javaBridge && typeof window.javaBridge.login === "function") {
      window.javaBridge.login(loginForm.identity, loginForm.password);
    } else {
      setLoginStatus({
        message: "Không kết nối được với ứng dụng Java.",
        success: false,
      });
    }
  }

  function handleRegisterSubmit(event) {
    event.preventDefault();
    if (!bridgeReady) {
      setRegisterStatus({
        message: "Ứng dụng Java chưa sẵn sàng. Vui lòng đợi 1 giây rồi thử lại.",
        success: false,
      });
      return;
    }
    if (
      window.javaBridge &&
      typeof window.javaBridge.register === "function"
    ) {
      window.javaBridge.register(
        registerForm.fullName,
        registerForm.email,
        registerForm.password,
        registerForm.confirmPassword
      );
    } else {
      setRegisterStatus({
        message: "Không kết nối được với ứng dụng Java.",
        success: false,
      });
    }
  }

  return (
    <div
      className={`auth-container ${mode === "register" ? "to-register" : "to-login"}`}
      id="authCard"
    >
      <div className="form-container sign-in-container">
        <form onSubmit={handleLoginSubmit}>
          <i className="fa-solid fa-brain logo-icon fade-up-element"></i>
          <h2 className="title fade-up-element" id="typewriterText">
            {title}
          </h2>

          <div className="form-group w-100 fade-up-element">
            <label className="form-label">Tên đăng nhập hoặc Email</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-user input-icon"></i>
              <input
                type="text"
                className="form-input"
                placeholder="Nhập tài khoản..."
                value={loginForm.identity}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    identity: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="form-group w-100 fade-up-element">
            <label className="form-label">Mật khẩu</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock input-icon"></i>
              <input
                type="password"
                className="form-input"
                placeholder="Nhập mật khẩu..."
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <a
            href="#"
            className="forgot-pass fade-up-element"
            style={{ alignSelf: "flex-start" }}
            onClick={(event) => event.preventDefault()}
          >
            Quên mật khẩu?
          </a>

          <div className="w-100 fade-up-element">
            <button type="submit" className="login-btn pill-btn" id="loginBtn">
              <span className="hover-circle"></span>
              <span className="label-stack">
                <span className="pill-label">ĐĂNG NHẬP</span>
                <span className="pill-label-hover">ĐĂNG NHẬP</span>
              </span>
            </button>
          </div>

          <div id="loginStatus" className={statusClass(loginStatus)}>
            {loginStatus.message}
          </div>
        </form>
      </div>

      <div className="form-container sign-up-container">
        <form onSubmit={handleRegisterSubmit}>
          <i className="fa-solid fa-user-plus logo-icon fade-up-element"></i>
          <h2 className="title fade-up-element">ĐĂNG KÍ TÀI KHOẢN</h2>

          <div className="form-group w-100 fade-up-element">
            <label className="form-label">Họ và Tên</label>
            <div className="input-wrapper">
              <i
                className="fa-solid fa-address-card input-icon"
                style={{ color: iconColor(registerForm.fullName, isNameValid) }}
              ></i>
              <input
                type="text"
                className="form-input"
                placeholder="Nhập họ tên..."
                value={registerForm.fullName}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    fullName: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="form-group w-100 fade-up-element">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <i
                className="fa-solid fa-envelope input-icon"
                style={{ color: iconColor(registerForm.email, isEmailValid) }}
              ></i>
              <input
                type="email"
                className="form-input"
                placeholder="...@gmail.com"
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="form-group w-100 fade-up-element">
            <label className="form-label">Mật khẩu</label>
            <div className="input-wrapper">
              <i
                className="fa-solid fa-lock input-icon"
                style={{
                  color: iconColor(registerForm.password, isPasswordValid),
                }}
              ></i>
              <input
                type="password"
                className="form-input"
                placeholder="Tối thiểu 8 ký tự, 1 kí tự hoa, đặc biệt..."
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="form-group w-100 fade-up-element">
            <label className="form-label">Xác nhận mật khẩu</label>
            <div className="input-wrapper">
              <i
                className="fa-solid fa-check-double input-icon"
                style={{
                  color: iconColor(
                    registerForm.confirmPassword,
                    isConfirmValid
                  ),
                }}
              ></i>
              <input
                type="password"
                className="form-input"
                placeholder="Nhập lại mật khẩu..."
                value={registerForm.confirmPassword}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="w-100 fade-up-element">
            <button
              type="submit"
              className="login-btn pill-btn"
              id="registerBtn"
            >
              <span className="hover-circle"></span>
              <span className="label-stack">
                <span className="pill-label">ĐĂNG KÝ NGAY</span>
                <span className="pill-label-hover">ĐĂNG KÝ NGAY</span>
              </span>
            </button>
          </div>

          <div id="registerStatus" className={statusClass(registerStatus)}>
            {registerStatus.message}
          </div>
        </form>
      </div>

      <div className="overlay-layer">
        <div className="overlay-panel overlay-left">
          <h2 className="wipe-element" style={{ "--i": 0 }}>
            Đã có tài khoản?
          </h2>
          <p className="wipe-element" style={{ "--i": 1 }}></p>
          <button
            className="ghost-btn wipe-element"
            id="signInToggle"
            style={{ "--i": 2 }}
            type="button"
            onClick={() => setMode("login")}
          >
            ĐĂNG NHẬP
          </button>
        </div>

        <div className="overlay-panel overlay-right">
          <h2 className="wipe-element" style={{ "--i": 0 }}>
            Chưa có tài khoản?
          </h2>
          <p className="wipe-element" style={{ "--i": 1 }}></p>
          <button
            className="ghost-btn wipe-element"
            id="signUpToggle"
            style={{ "--i": 2 }}
            type="button"
            onClick={() => setMode("register")}
          >
            ĐĂNG KÝ NGAY
          </button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<AuthApp />);
