export default (axios) => ({
    createRoom: (param) => axios.post('/room', param).then((res) => res.data.data),
    getHostTokenRtc: (param) => axios.post('/agora/room/host-rtc-token', param).then((res) => res.data.data),
});
