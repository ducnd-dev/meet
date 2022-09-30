export async function addStream(userInfo) {
    const wrapper = document.getElementById(userInfo.uid);
    if (wrapper) {
        if (userInfo.videoTrack) {
            userInfo.videoTrack.play(wrapper, { muted: true });
            handleShowStatusDevice('video', userInfo.uid, true);
        }
    }
}

export function handleShowStatusDevice(type, uid, status) {
    const el = document.querySelectorAll(`.${type}-${uid}`);
    if (el && el.length > 0) {
        el.forEach((item) => {
            item.setAttribute('src', `/images/room/${type}-${status ? 'on' : 'off-white'}.svg`);
            if (!status) {
                item.classList.add('control-member');
            } else {
                item.classList.remove('control-member');
            }
        });
    }
    const wrapper = document.getElementById(uid);
    if (wrapper) wrapper.setAttribute(`data-${type}`, status);
}

export function randomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}
export function getAvtByName(name) {
    return name.split(' ').map((str) => str[0]).join('');
}
