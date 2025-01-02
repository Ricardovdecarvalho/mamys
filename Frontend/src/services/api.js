// src/services/api.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Substitua pela URL correta da API

export const getClonedPages = async () => {
  const response = await axios.get(`${API_BASE_URL}/pages`);
  return response.data;
};

export const getPageDetails = async (pageId) => {
  const response = await axios.get(`${API_BASE_URL}/pages/${pageId}`);
  return response.data;
};

export const updatePageDetails = async (pageId, pageData) => {
  const response = await axios.put(`${API_BASE_URL}/pages/${pageId}`, pageData);
  return response.data;
};