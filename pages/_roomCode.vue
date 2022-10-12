<template>
    <div
        id="live-class"
        :loading="isLoading"
        class="flex flex-col relative gap-1 bg-prim-5 overflow-hidden live-room h-screen p-5 pb-0"
    >
        <div id="live-class-content-wrapper" :class="getContentClass">
            <div
                id="room"
                class="flex justify-center items-center gap-4 relative overflow-y-auto mt-4 flex-wrap w-full h-full"
                :class="getRoomClass"
            >
                <div
                    v-for="member in getMembers"
                    :id="member.id"
                    :key="member.id"
                    class="flex-1 relative rounded-sm overflow-hidden min-w-[220px] min-h-[160px] aspect-video cursor-pointer bg-black"
                    :class="getMenberClass(member)"
                    @click="handleMemberClick(member)"
                >
                    <div class="absolute z-30 h-10 px-3 py-1 overflow-hidden right-0 bottom-0 left-0 status flex justify-between">
                        <span class="text-white truncate mr-3"> {{ getAvtByName(member.full_name) }} </span>
                        <div class="flex items-center gap-2">
                            <img :class="`audio-${member.id}`" :src="`/images/room/audio-off-white.svg`" class="w-4 h-4">
                            <img :class="`video-${member.id}`" :src="`/images/room/video-off-white.svg`" class="w-4 h-4">
                        </div>
                    </div>
                </div>
            </div>
            <div
                :class="getMembersClass"
            >
                <members
                    v-if="actionStatus.joined"
                    :room-members="roomMembers"
                    :room-id="options.roomId"
                    :is-host="isHost"
                    :action-status="actionStatus"
                />
            </div>
        </div>
        <div
            :class="getActionClass"
        >
            <room-action
                class="mt-3"
                :check-device="checkDevice"
                :options="options"
                :is-host="isHost"
                :room-members="roomMembers"
                :status-prop="actionStatus"
                @clickActions="handleActionsClick"
                @screenShare="handleShareScreen"
                @toggleFullScreen="toggleFullScreen"
                @leave="outStream()"
            />
        </div>
        <ModalLogin ref="login" @logined="init" />
    </div>
</template>
<script>
    import { debounce } from 'lodash';
    import RoomAction from '@/components/room/RoomAction.vue';
    import Members from '@/components/room/Members.vue';
    import ModalLogin from '@/components/auth/modal/Login.vue';
    import {
        addStream, handleShowStatusDevice, getAvtByName, randomColor,
    } from '@/utils/room';

    export const APP_ID = process.env.AGORA_APP_ID;
    export const APP_IDENTIFIER = process.env.AGORA_APP_IDENTIFIER;

    export default {
        layout: 'room',
        components: {
            RoomAction,
            Members,
            ModalLogin,
        },
        async asyncData({ query, redirect }) {
            try {
                return {
                    role: query.role || '',
                };
            } catch (error) {
                redirect('/');
            }
        },

        data: () => ({
            checkJoin: false,
            options: {},
            showControl: {
                type: '',
                show: false,
            },
            showActionFullScreen: true,
            remoteUsers: [],
            actionStatus: {
                hasAudio: false,
                hasVideo: false,
                people: false,
                speaker: true,
                zoom: false,
                joined: false,
                isScreenShare: false,
            },
            elementWrapper: null,
            isHost: false,
            isLoading: false,
            rtc: {},
            roomMembers: [],
            checkDevice: {
                hasAudio: false,
                hasVideo: false,
            },
            memberSelected: {},
        }),

        computed: {
            getRoomClass() {
                return ` ${this.actionStatus.zoom ? 'w-full h-[80vh]' : 'mb-3 lg:mb-14'}`;
            },

            getContentClass() {
                return 'flex flex-1 h-full content-wrapper';
            },

            getMembersClass() {
                return this.actionStatus.people ? 'flex  w-full lg:w-2/6' : 'opacity-0 w-0';
            },

            getActionClass() {
                return 'flex  justify-center actions-wrapper p-3 z-50';
            },

            getMembers() {
                if (this.memberSelected.id) {
                    return this.roomMembers.reduce((acc, element) => {
                        if (element.id === this.memberSelected.id) {
                            return [element, ...acc];
                        }
                        return [...acc, element];
                    }, []);
                }
                return this.roomMembers;
            },
        },

        watch: {
            'actionStatus.hasAudio': async function (status) {
                if (this.rtc.localAudioTrack && this.checkJoin) {
                    await this.rtc.localAudioTrack.setEnabled(status);
                    handleShowStatusDevice('audio', this.options.uid, status);
                    if (!status) {
                        const el = document.getElementById(this.options.uid);
                        if (el) el.style.border = '0';
                    }
                }
            },
            'actionStatus.hasVideo': async function (status) {
                if (this.rtc.localVideoTrack && this.checkJoin) {
                    await this.rtc.localVideoTrack.setEnabled(status);
                    handleShowStatusDevice('video', this.options.uid, status);
                }
            },
            'actionStatus.speaker': function (status) {
                if (this.rtc.client && !status) {
                    this.remoteUsers.forEach((user) => {
                        user.audioTrack.setVolume(0);
                    });
                    return;
                }
                this.remoteUsers.forEach((user) => {
                    user.audioTrack.setVolume(200);
                });
            },
        },

        async mounted() {
            if (window.location.protocol !== 'https:' && !window.location.href.includes('localhost')) {
                window.location.replace(`https:${window.location.href.substring(window.location.protocol.length)}`);
                return;
            }
            if (!this.$auth.loggedIn) {
                this.$refs.login.open();
                this.$auth.options.redirect = false;
                return;
            }
            this.init();
        },

        beforeDestroy() {
            this.outStream();
        },

        methods: {
            getAvtByName,
            randomColor,
            async init() {
                this.handleCheckDevice();
                this.rtc = {
                    localAudioTrack: null,
                    localVideoTrack: null,
                    client: await this.$AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }),
                };

                this.isLoading = true;
                this.handleFullScreen();
                await this.initData();
            },

            handleCheckDevice() {
                navigator.mediaDevices.enumerateDevices()
                    .then((devices) => {
                        const microphones = devices.filter((d) => d.kind === 'audioinput');
                        const cameras = devices.filter((d) => d.kind === 'videoinput');
                        this.checkDevice = {
                            hasAudio: microphones.length > 0,
                            hasVideo: cameras.length > 0,
                        };
                    });
            },

            handleMemberClick(member) {
                this.memberSelected = this.memberSelected.id !== member.id ? member : {};
            },

            getMenberClass(member) {
                if (this.memberSelected.id) {
                    return this.memberSelected.id === member.id ? 'grow' : 'grow-0';
                }
                return 'grow';
            },

            async initAgora() {
                this.options.tokenRtc = await this.$api.room.getHostTokenRtc({
                    room_id: +this.options.roomId,
                });
                this.roomMembers = [this.$auth.user];
                this.rtc.client.enableAudioVolumeIndicator();
                this.remoteUsers = await this.rtc.client.remoteUsers;
                await this.initStream();
            },

            async getMemberOfRoom(uid, join) {
                this.remoteUsers = await this.rtc.client.remoteUsers;

                if (uid) {
                    if (!join) {
                        this.roomMembers = this.roomMembers.filter((item) => item.id !== uid);
                        await this.addUserToList(uid);
                    } else {
                        await this.addUserToList(uid);
                    }
                } else {
                    this.remoteUsers.map(async (item) => {
                        await this.addUserToList(item.uid);
                    });
                }
            },

            async getRoomDetail() {
                const roomDetail = await this.$api.room.getRoomByNanoLink(this.$route.params.roomCode);
                this.options = {
                    classId: roomDetail.class_id,
                    roomId: roomDetail.id,
                    uid: this.$auth.user.id,
                    uidChat: '',
                    channel: `${roomDetail.name}_${roomDetail.id}`,
                    creator: roomDetail.creator,
                    roomName: roomDetail.name,
                    endedAt: roomDetail.ended_at,
                };
            },

            async initData() {
                try {
                    if (!this.$route.params.roomCode) {
                        this.$router.go(-1);
                    } else {
                        await this.getRoomDetail();
                        this.isHost = this.options.uid === this.options.creator;
                        if (this.$route.query.role === 'host') {
                            this.isHost = true;
                        }
                        this.checkJoin = true;
                        this.initAgora();
                    }
                } catch (error) {
                    console.log(error, 'error');
                }
            },

            handleLeave() {
                this.outStream();
            },

            hiddenAction() {
                if (this.actionStatus.zoom) {
                    this.showActionFullScreen = false;
                }
            },

            debounceAction: debounce(function () {
                this.hiddenAction();
            }, 1500),

            async handleShareScreen() {
                try {
                    if (this.actionStatus.isScreenShare) {
                        await this.handleTrackEnd();
                        return;
                    }
                    this.actionStatus.isScreenShare = true;
                    this.rtc.localScreenTrack = await this.$AgoraRTC.createScreenVideoTrack({
                        encoderConfig: '1080p_1',
                        optimizationMode: 'detail',
                    });
                    if (this.rtc.localVideoTrack) {
                        await this.rtc.client.unpublish(this.rtc.localVideoTrack);
                        this.rtc.localVideoTrack.close();
                    }
                    await this.rtc.client.publish(this.rtc.localScreenTrack);
                    addStream({
                        uid: this.options.uid,
                        hasAudio: this.actionStatus.hasAudio,
                        hasVideo: this.actionStatus.hasVideo,
                        videoTrack: this.rtc.localScreenTrack,
                    });
                    await this.rtc.localScreenTrack.on('track-ended', this.handleTrackEnd);
                } catch (error) {
                    this.actionStatus.isScreenShare = false;
                    console.log(error);
                } finally {
                    this.$forceUpdate();
                }
            },
            async handleTrackEnd() {
                try {
                    this.rtc.localVideoTrack = await this.$AgoraRTC.createCameraVideoTrack();
                    await this.rtc.client.unpublish(this.rtc.localScreenTrack);
                    this.rtc.localScreenTrack.close();
                    // this.actionStatus.hasVideo = true;
                    await this.rtc.client.publish(this.rtc.localVideoTrack);
                    await this.rtc.localVideoTrack.setEnabled(this.actionStatus.hasVideo);
                    addStream({
                        uid: this.options.uid,
                        hasAudio: this.actionStatus.hasAudio,
                        hasVideo: this.actionStatus.hasVideo,
                        videoTrack: this.rtc.localVideoTrack,
                    });
                } catch (error) {
                    await this.rtc.client.unpublish(this.rtc.localScreenTrack);
                    this.rtc.localScreenTrack.close();
                } finally {
                    this.actionStatus.isScreenShare = false;
                    handleShowStatusDevice('video', this.options.uid, this.actionStatus.hasVideo);
                }
            },
            handleActionsClick(param) {
                if (param.field === 'chat') {
                    this.actionStatus.document = false;
                    this.actionStatus.people = false;
                    // return;
                }
                if (param.field === 'people') {
                    this.actionStatus.chat = false;
                    this.actionStatus.document = false;
                    // return;
                }
                this.actionStatus[param.field] = param.status;
            },

            toggleFullScreen() {
                const room = document.getElementById('live-class');
                if (document.fullscreenElement || document.webkitFullscreenElement
                    || document.mozFullScreenElement) {
                    document.exitFullscreen();
                } else {
                    this.actionStatus.zoom = true;
                    room.requestFullscreen();
                }
            },

            async initStream() {
                try {
                    await this.rtc.client.join(APP_ID, this.options.channel, this.options.tokenRtc, this.options.uid);
                    this.remoteUsers = await this.rtc.client.remoteUsers;
                    await this.handleEvent();
                    // create and publish audio
                    if (this.checkDevice.hasAudio) {
                        this.rtc.localAudioTrack = await this.$AgoraRTC.createMicrophoneAudioTrack();
                        if (this.rtc.localAudioTrack) {
                            await this.rtc.client.publish(this.rtc.localAudioTrack);
                            this.actionStatus.hasAudio = false;
                            this.rtc.localAudioTrack.setEnabled(false);
                        }
                    }
                    // create and publish camera
                    if (this.checkDevice.hasVideo) {
                        this.rtc.localVideoTrack = await this.$AgoraRTC.createCameraVideoTrack();
                        await this.rtc.client.publish(this.rtc.localVideoTrack);
                        this.rtc.localVideoTrack.setEnabled(this.actionStatus.hasVideo);
                    }
                    await this.loadListStream();
                } catch (error) {
                    console.log(error);
                    this.handleFail(error);
                } finally {
                    await addStream({
                        uid: this.options.uid,
                        hasAudio: this.actionStatus.hasAudio,
                        hasVideo: this.actionStatus.hasVideo,
                        videoTrack: this.rtc.localVideoTrack,
                    });
                    this.isLoading = false;
                    this.actionStatus.joined = true;
                }
            },
            handleFail(error) {
                switch (error.code) {
                    case 'INVALID_OPERATION':
                        // this.outStream(this.options.uid);
                        break;
                    case 'ERR_REPEAT_JOIN':
                        this.$message.error('User join from other places');
                        this.outStream();
                        // this.$router.go(-1);
                        break;
                    case 'UID_CONFLICT':
                        this.$message.error('User joined');
                        this.outStream();
                        // this.$router.go(-1);
                        break;
                    case 'OPERATION_ABORTED':
                        // this.outStream();
                        break;
                    case 'PERMISSION_DENIED':
                        // this.outStream();
                        break;
                    default:
                        console.log(error.code, 'fail');
                        break;
                }
            },
            async handleEvent() {
                this.rtc.client.on(('connection-state-change'), (curState) => {
                    if (curState === 'RECONNECTING') {
                        this.$message.warning('RECONNECTING');
                        return;
                    }
                    if (curState === 'CONNECTED') {
                        this.$message.success('CONNECTED');
                        return;
                    }
                    if (curState === 'DISCONNECTING') {
                        this.$message.warning('DISCONNECTING');
                        return;
                    }
                    if (curState === 'DISCONNECTED') {
                        this.$message.error('DISCONNECTED');
                        return;
                    }
                    if (curState === 'CONNECTING') {
                        this.$message.warning('CONNECTING');
                    }
                });

                this.rtc.client.on('user-published', async (user, mediaType) => {
                    await this.rtc.client.subscribe(user, mediaType);
                    addStream(user);
                    if (mediaType === 'audio') {
                        const remoteAudioTrack = user.audioTrack;
                        remoteAudioTrack.play();
                        handleShowStatusDevice('audio', user.uid, true);
                    }
                });

                this.rtc.client.on('user-unpublished', async (user, mediaType) => {
                    if (mediaType === 'video') {
                        handleShowStatusDevice('video', user.uid, false);
                    }
                    if (mediaType === 'audio') {
                        handleShowStatusDevice('audio', user.uid, false);
                    }
                });

                this.rtc.client.on('user-left', (user) => {
                    this.roomMembers = this.roomMembers.filter((item) => item.id !== user.uid);
                });

                this.rtc.client.on('user-joined', async (user) => {
                    try {
                        if (user.uid === this.options.uid) {
                            this.$message.error('User join from other places', false);
                            this.outStream();
                            return;
                        }
                        await this.getRoomDetail();
                        await this.getMemberOfRoom(user.uid, true);
                        addStream(user);
                    } catch (error) {
                        this.handleFail(error);
                    }
                });

                this.rtc.client.on('volume-indicator', this.handleVolumeIndicator);
            },

            async addUserToList(uid) {
                if (!this.roomMembers.some((item) => item.id === uid)) {
                    const user = await this.$api.user.getUser(uid);
                    this.roomMembers.push(user);
                }
            },

            async loadListStream() {
                this.remoteUsers = this.rtc.client.remoteUsers;
                this.remoteUsers.map(async (user) => {
                    this.addUserToList(user.uid);
                    if (!document.getElementById(user.uid)) {
                        if (user.hasVideo) {
                            await this.rtc.client.subscribe(user, 'video');
                            addStream(user);
                        }
                        if (user.hasAudio) {
                            await this.rtc.client.subscribe(user, 'audio');
                            user.audioTrack.play();
                        }
                    }
                });
                this.$message.success('Join successfully!');
            },

            async outStream() {
                if (this.rtc.localAudioTrack) {
                    this.rtc.localAudioTrack?.close();
                }
                if (this.rtc.localVideoTrack) {
                    this.rtc.localVideoTrack?.close();
                }
                if (this.rtc.client) {
                    await this.rtc.client?.leave();
                }
                // if (this.isHost) {
                //     this.handleAutoRollCall(false);
                // }
                this.$auth?.logout();
            },

            handleFullScreen() {
                document.addEventListener('fullscreenchange', () => {
                    if (document.fullscreenElement) {
                        // console.log(document);
                    } else {
                        this.actionStatus.zoom = false;
                        this.showActionFullScreen = true;
                    }
                });

                document.addEventListener('mozfullscreenchange', () => {
                    if (document.fullscreenElement) {
                        // console.log(document);
                    } else {
                        this.showActionFullScreen = true;
                        this.actionStatus.zoom = false;
                    }
                }, false);

                document.addEventListener('webkitfullscreenchange', () => {
                    if (document.fullscreenElement) {
                        // console.log(document);
                    } else {
                        this.showActionFullScreen = true;
                        this.actionStatus.zoom = false;
                    }
                }, false);
            },

            handleVolumeIndicator(volumes) {
                volumes.forEach((volume) => {
                    const wrapper = document.getElementById(volume.uid);
                    if (wrapper) {
                        if (volume.level > 10) {
                            wrapper.style.border = '2px solid blue';
                        } else {
                            wrapper.style.border = '0';
                        }
                    }
                });
            },
        },
    };
</script>

<style lang="scss" scroped>
#room {
    @apply overflow-hidden;
}

video {
    @apply max-w-full max-h-full aspect-video;
}
.content-wrapper {
    height: calc(100vh - 200px);
}

.back-drop {
    backdrop-filter: blur(8px);
}
.height-full-screen {
    /* height: calc(100% - 100px); */
}
@keyframes expand {
  from {
    transform: scale(99%);
  }
}
.box-lc {
  animation: expand .5s ;
}
</style>
