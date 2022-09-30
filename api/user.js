export default (axios) => ({
    getUser: (userId) => axios.get(`/user/${userId}`).then((res) => res.data.data),
});
