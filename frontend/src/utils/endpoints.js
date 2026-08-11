export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
  },
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    DETAIL: (id) => `/users/${id}`,
  },
  STUDENTS: {
    LIST: "/students",
    CREATE: "/students",
    DETAIL: (id) => `/students/${id}`,
    TIMELINE: (id) => `/students/${id}/timeline`,
    DEVELOPMENT: (id) => `/students/${id}/development`,
  },
  DAILY_REPORTS: {
    LIST: "/daily-reports",
    CREATE: "/daily-reports",
    APPROVE: (id) => `/daily-reports/${id}/approve`,
    DETAIL: (id) => `/daily-reports/${id}`,
  },
  DEVELOPMENTS: {
    LIST: "/developments",
  },
  AI: {
    GENERATE_REPORT: "/ai/generate-report",
  },
  LMS: {
    COURSES: "/courses",
    LESSONS: (courseId) => `/courses/${courseId}/lessons`,
    QUIZZES: "/quizzes",
  },
  SCHOOLS: {
    LIST: "/schools",
    CREATE: "/schools",
    UPDATE: (id) => `/schools/${id}`,
    DELETE: (id) => `/schools/${id}`,
  },
  CLASSES: {
    LIST: "/classes",
    CREATE: "/classes",
  },
  SUBSCRIPTIONS: {
    LIST: "/subscriptions",
  },
  MESSAGES: {
    LIST: "/messages",
    SEND: "/messages",
  },
  UPLOADS: {
    UPLOAD_FILE: "/upload",
    GET_URL: (filePath) => getUploadUrl(filePath),
  }
};

export const getUploadUrl = (filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:')) {
    return filePath;
  }
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const serverBase = apiBase.replace(/\/api\/?$/, '');
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${serverBase}${cleanPath.startsWith('/uploads') ? cleanPath : `/uploads${cleanPath}`}`;
};
