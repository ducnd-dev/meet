<template>
    <div class="flex justify-center actions gap-4">
        <div class="flex justify-between items-center gap-4">
            <img :src="`/images/room/mic-${ statusProp.hasAudio ? 'on' : 'off'}.svg`" title="voice" class="  object-cover cursor-pointer w-8 md:w-11 h-8 md:h-11 lg:w-14 lg:h-14" @click="handleClick('hasAudio')">
            <img :src="`/images/room/camera-${ statusProp.hasVideo ? 'on':'off'}.svg`" title="camera" class=" object-cover cursor-pointer w-8 md:w-11 h-8 md:h-11 lg:w-14 lg:h-14" @click="handleClick('hasVideo')">
            <img :src="`/images/room/share-screen-${statusProp.isScreenShare ? 'on':'off' }.svg`" title="screen share" class=" cursor-pointer w-8 md:w-11 h-8 md:h-11 lg:w-14 lg:h-14" @click="handleShare">
            <img src="/images/room/end-call.svg" title="end" class=" cursor-pointer w-8 md:w-11 h-8 md:h-11 lg:w-14 lg:h-14" @click="handleClickLeave">
            <div class="relative">
                <img :src="`/images/room/people-${statusProp.people?'on':'off'}.svg`" title="members" class="object-cover  cursor-pointer w-8 md:w-11 h-8 md:h-11 lg:w-14 lg:h-14" @click="handleClick('people')">
                <i
                    :class="`${statusProp.people?'absolute top-1 right-1 lg:right-3 text-xs text-danger-100 ':'absolute top-1 right-1 lg:right-3 text-xs  text-gray-900'}`"
                >{{ getTotalMembers }}</i>
            </div>
            <img src="/images/room/full-screen-off.svg" title="full screen" class=" object-cover cursor-pointer w-8 md:w-11 h-8 md:h-11 lg:w-14 lg:h-14" @click="fullScreen">
        </div>
    </div>
</template>
<script>

    export default {
        props: {
            roomMembers: {
                type: Array,
                default: () => ([]),
            },
            statusProp: Object,
            socketProp: {
                type: Object,
            },
            isHost: {
                type: Boolean,
                default: false,
            },
            micPermission: {
                type: Boolean,
                default: true,
            },
            showBoard: {
                type: Boolean,
                default: false,
            },
            options: {
                type: Object,
                default: () => ({}),
            },
            chatNotSeen: {
                type: Number,
                default: 0,
            },
            checkDevice: {
                type: Object,
                default: () => ({
                    hasAudio: false,
                    hasvideo: false,
                }),
            },
        },
        data: () => ({
            showPopper: {
                left: false,
                right: false,
            },
        }),
        computed: {

            getClass() {
                return `/images/room/mic-${this.statusProp.mic ? 'on' : 'off'}.svg`;
            },
            getTotalMembers() {
                return this.roomMembers.length;
            },

        },
        mounted() {
            this.totalMember = this.roomMembers.filter((item) => item.status === 'ONLINE').length;
        },
        methods: {
            handleClickLeave() {
                this.$confirm({
                    title: 'Are you sure you want to leave this room?',
                    onOk() {
                        window.close();
                    },
                    onCancel() {
                        console.log('Cancel');
                    },
                    class: 'test',
                });
            },
            async handleRoomInteraction(action) {
                if (action === 'ROLL_CALL') {
                    const ids = this.roomMembers.filter((item) => item.user_id !== this.options.creator).map((item) => item.user_id);
                    await this.$api.liveClassRoom.room.rollCall({
                        room_id: this.options.roomId,
                        attendant_user_ids: ids,
                    });
                } else {
                    const userOnmic = document.querySelectorAll('[data-audio="true"]');
                    if (userOnmic.length > 0) {
                        userOnmic.forEach(async (el) => {
                            const id = el.getAttribute('id');
                            await this.$api.liveClassRoom.room.pushNotification({
                                action,
                                room_id: this.options.roomId,
                                user_id: id,
                            });
                        });
                    } else if (!this.isHost) {
                        await this.$api.liveClassRoom.room.pushNotification({
                            action,
                            room_id: this.options.roomId,
                            user_id: this.isHost ? this.options.uid : this.options.creator,
                        });
                    }
                }
            },
            handleClick(field) {
                if (field === 'hasAudio' && !this.micPermission) return;
                this.$emit('clickActions', { field, status: !this.statusProp[field] });
            },
            handleShare() {
                this.togglePoperLeft();
                this.$emit('screenShare');
            },
            handleShowBroad() {
                this.togglePoperLeft();

                this.$emit('clickBroad');
            },
            fullScreen() {
                this.$emit('toggleFullScreen');
            },
            togglePoperLeft() {
                this.showPopper.left = !this.showPopper.left;
            },
            togglePoperRight() {
                this.showPopper.right = !this.showPopper.right;
            },
            hideLeft() {
                if (this.showPopper.left) {
                    this.showPopper.left = false;
                }
            },
            hideRight() {
                if (this.showPopper.right) {
                    this.showPopper.right = false;
                }
            },
        },
    };
</script>
<style lang="scss" scoped>
    // .popper {
    //     z-index: 1000000;
    // }
    // .check{
    //     &:hover {
    //         background-color: $prim-5;
    //         color: $prim-100;
    //         svg {
    //             stroke: $prim-100;
    //         }
    //     }
    // }
</style>
<style lang="scss">
    .ant-modal-confirm-btns {
        @apply flex;
    }
</style>
