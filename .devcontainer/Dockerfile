# Sử dụng image chính thức của Microsoft cho môi trường Java (chọn Java 17 vì tính ổn định cao)
FROM mcr.microsoft.com/vscode/devcontainers/java:17

# Cập nhật hệ thống và cài đặt Python 3 cùng các công cụ cần thiết (pip, venv)
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# (Tùy chọn) Cài đặt thêm các thư viện Python nếu cần dùng ngay cho AI
# RUN pip3 install requests numpy