import axiosClient from './axiosClient';

const professionalProfileApi = {
  getAll: (params, config = {}) => axiosClient.get('/professional-profiles', { params, ...config }),
  getOptions: () => axiosClient.get('/professional-profiles/options'),
  getStats: () => axiosClient.get('/professional-profiles/stats'),
  getById: (id) => axiosClient.get(`/professional-profiles/${id}`),
  create: (data) => axiosClient.post('/professional-profiles', data),
  update: (id, data) => axiosClient.post(`/professional-profiles/${id}`, data),
  submit: (id) => axiosClient.post(`/professional-profiles/${id}/submit`),
  approve: (id) => axiosClient.post(`/professional-profiles/${id}/approve`),
  reject: (id, reason) => axiosClient.post(`/professional-profiles/${id}/reject`, { reason }),
  invalidate: (id) => axiosClient.post(`/professional-profiles/${id}/invalidate`),
  bulkApprove: (ids) => axiosClient.post('/professional-profiles/bulk-approve', { ids }),
  bulkReject: (ids, reason) => axiosClient.post('/professional-profiles/bulk-reject', { ids, reason }),
  getHistory: (id) => axiosClient.get(`/professional-profiles/${id}/history`),
  getMine: () => axiosClient.get('/my-professional-profile'),
  updateMine: (id, data) => axiosClient.put(`/my-professional-profile/${id}`, data),
  submitMine: (id) => axiosClient.post(`/my-professional-profile/${id}/submit`),
  downloadCertificate: (certificateId) =>
    axiosClient.get(`/professional-profiles/certificates/${certificateId}/download`, {
      responseType: 'blob',
    }),
};

export const triggerCertificateDownload = async (certificateId, fallbackName = 'certificate') => {
  const response = await professionalProfileApi.downloadCertificate(certificateId);
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
  const disposition = response.headers?.['content-disposition'] || '';
  const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i);
  const fileName = match ? decodeURIComponent(match[1]) : fallbackName;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default professionalProfileApi;
