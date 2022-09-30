export async function addStream(userInfo, creator, share, $api) {
    const user = await $api.liveClassRoom.room.getUser(userInfo.uid);
    handleRemoveEmptyImg(userInfo.uid);
    let wrapper = document.getElementById(userInfo.uid);
    if (wrapper) {
        if (userInfo.videoTrack) {
            userInfo.videoTrack.play(wrapper, { muted: true });
            handleShowStatusDevice('video', userInfo.uid, share ? true : userInfo.hasVideo);
        } else {
            handleAddEmptyImg(userInfo.uid, $api);
        }
    } else {
        wrapper = document.createElement('div');
        wrapper.id = userInfo.uid;
        wrapper.className = 'flex flex-1 flex-col justify-center items-center rounded-xl overflow-hidden w-full h-full bg-white relative box-lc';
        if (userInfo.uid === creator) {
            const display = document.querySelector('[data-name="display"]');
            if (display) {
                display.setAttribute('data-name', '');
                const slider = document.getElementById('room-student');
                slider.append(display);
            }
            wrapper.setAttribute('data-name', 'display');
            const elementWrapper = document.getElementById('room');
            const divControl = `<div class="absolute bottom-0 right-0 left-0  w-full p-3  h-12 bg-black bg-opacity-40 text-white flex items-center justify-between z-10 control">
            <span class='truncate w-1/2'>${user.full_name !== null ? user.full_name : ''}</span>
            <div class="control-item flex gap-2">
                <img class="audio-${userInfo.uid}" src="/images/room/audio-${userInfo.hasAudio ? 'on' : 'off-white'}.svg" class="object-cover w-8 h-8">
                <img class="video-${userInfo.uid}" src="/images/room/video-${userInfo.hasVideo ? 'on' : 'off-white'}.svg" class="object-cover w-8 h-8"/>
            </div>
            </div>`;
            wrapper.append(stringToHTML(divControl));
            elementWrapper.append(wrapper);
        } else {
            const student = document.getElementById('room-student');
            const divControl = `<div class="absolute bottom-0 right-0 left-0  w-full p-3  h-12 bg-black bg-opacity-40 text-white flex items-center justify-between z-10 control">
            <span class='truncate w-1/2'>${user.full_name !== null ? user.full_name : ''}</span>
            <div class="control-item flex gap-2">
                <img class="audio-${userInfo.uid}" src="/images/room/audio-${userInfo.hasAudio ? 'on' : 'off-white'}.svg" class="object-cover w-8 h-8">
                <img class="video-${userInfo.uid}" src="/images/room/video-${userInfo.hasVideo ? 'on' : 'off-white'}.svg" class="object-cover w-8 h-8"/>
            </div>
            </div>`;
            wrapper.append(stringToHTML(divControl));
            student.append(wrapper);
        }
        if (userInfo.videoTrack) {
            userInfo.videoTrack.play(wrapper, { muted: true });
        } else {
            handleAddEmptyImg(userInfo.uid, $api);
        }
    }
    wrapper.setAttribute('data-audio', userInfo.hasAudio);
    wrapper.setAttribute('data-video', userInfo.hasVideo);
    // wrapper.setAttribute('data-fullname', `${user && (user.full_name ? user.full_name : '')}`);
    // wrapper.setAttribute('data-handup', isHandup);
}
export async function handleAddEmptyImg(idWrapper, $api) {
    const user = await $api.liveClassRoom.room.getUser(idWrapper);

    const userContainer = document.getElementById(idWrapper);
    if (userContainer) {
        let img = document.getElementById(`img-${idWrapper}`);
        if (!img) {
            img = document.createElement('div');
            img.setAttribute('id', `img-${idWrapper}`);
            img.setAttribute('class', 'flex items-center justify-center w-12 h-12 object-cover rounded-full overflow-hidden img-avt');
            img.setAttribute('style', `background-color: ${randomColor()}; color: ${randomColor()};`);
            const name = user.full_name || '';
            img.innerText = getAvtByName(name);
            userContainer.append(img);
        }
    }
}
export function handleRemoveEmptyImg(id) {
    const img = document.getElementById(`img-${id}`);
    if (img) img.remove();
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
export function stringToHTML(string) {
    const t = document.createElement('template');
    t.innerHTML = string;
    return t.content;
}

export function randomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}
export function getAvtByName(name) {
    return name.split(' ').map((str) => str[0]).join('');
}
