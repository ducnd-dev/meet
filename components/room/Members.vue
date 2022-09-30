<template>
    <div v-if="actionStatus.joined" class="flex text-black flex-col flex-1 h-full overflow-hidden bg-white ml-6 relative border-l border-r border-b border-gray-20 pl-6  pr-1 pt-6">
        <div class=" font-semibold text-lg pr-5">
            <div class="border-b border-gray-20 pb-4">
                Members ({{ roomMembers.length }})
            </div>
        </div>
        <div class="overflow-y-auto list-user pr-4">
            <div v-for="item in getUserOnline" :key="item.id" class="flex user before:hidden items-center mt-6 justify-between">
                <div class="flex items-center">
                    <div :style="`background-color: ${randomColor()}; color: ${randomColor()}`" class="rounded-full aspect-square w-10 flex items-center font-semibold justify-center mr-3">
                        {{ getAvtByName(item.full_name) }}
                    </div>
                    <span class="text-sm truncate">{{ item.full_name || item.fullName }} </span>
                    <span>{{ item.user_id === uid ? ' (Bạn)' : '' }} </span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex';
    import { randomColor, getAvtByName } from '@/utils/room';

    export default {
        props: {
            options: {
                type: Object,
                default: () => ({}),
            },
            roomMembers: {
                type: Array,
                default: () => ([]),
            },
            roomId: {
                type: Number,
            },
            isHost: {
                type: Boolean,
                default: false,
            },
            actionStatus: {
                type: Object,
            },
            uid: {
                type: Number,
            },
        },
        data: () => ({
            toggleAbsents: false,
            members: [],
        }),
        computed: {
            ...mapGetters('live-class', ['getNotifications', 'getIsHost']),
            getUserOnline() {
                // return this.members.filter((item) => item.status === 'ONLINE');
                return this.members;
            },
            getUserOffline() {
                return this.members.filter((item) => item.status === 'OFFLINE');
            },

        },
        watch: {
            roomMembers() {
                this.members = this.roomMembers;
            },
        },
        mounted() {
            this.members = this.roomMembers;
        },
        methods: {

            randomColor,
            getAvtByName,
            getDevice(type, uid) {
                if (uid === this.uid) {
                    if (type === 'video') return this.actionStatus.hasVideo;
                    return this.actionStatus.hasAudio;
                }
                const getElement = document.getElementById(uid);
                if (getElement) return JSON.parse(getElement.getAttribute(`data-${type}`));
                return false;
            },
            handleClickDevice(type, user) {
                if (user.user_id === this.uid || !this.isHost) return;
                const wrapper = document.getElementById(user.user_id);
                if (wrapper) {
                    const status = wrapper.getAttribute(`data-${type}`);
                    let action = '';
                    if (type === 'audio') {
                        action = JSON.parse(status) ? 'MUTE_SELF' : 'REQUEST_TURN_ON_MIC';
                    }
                    if (type === 'video') {
                        action = JSON.parse(status) ? 'HOST_FORCE_MUTE' : 'REQUEST_TURN_ON_CAMERA';
                    }
                    if (action.includes('MUTE')) {
                        this.$api.liveClassRoom.room.roomControl({
                            action,
                            payload: {
                                user_id: user.user_id,
                            },
                            room_id: this.roomId,
                        });
                    } else {
                        this.$api.liveClassRoom.room.pushNotification({
                            action,
                            room_id: this.roomId,
                        });
                    }
                }
            },
        },
    };
</script>
<style lang="scss" scoped>
    .name {
        white-space: nowrap;
        overflow: hidden;
        width: 90%;
    }
    .lc-user-action {
        .control-member {
            filter: brightness(0.5);
        }
    }
</style>
