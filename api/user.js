export default (axios) => ({
    getUser: (userId) => axios.post(`/user/${userId}`).then((res) => res.data.data),
});
