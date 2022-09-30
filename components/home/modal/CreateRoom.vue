<template>
    <a-modal
        v-model="visible"
        title="Tạo phòng"
        :footer="false"
        @cancel="close"
    >
        <Form @submit="handleCreateRoom" />
    </a-modal>
</template>

<script>
    import Form from '@/components/home/form/CreateRoom.vue';

    export default {
        name: 'MeetCreateRoom',
        components: {
            Form,
        },
        data() {
            return {
                visible: false,
                isLoading: false,
            };
        },

        mounted() {

        },

        methods: {
            open() {
                this.visible = true;
            },

            close() {
                this.visible = false;
            },

            async handleCreateAccount(form) {
                await this.$auth.loginWith('local', {
                    data: {
                        full_name: form?.fullName || '',
                        role: 'HOST',
                    },
                });
            },

            async handleCreateRoom(form) {
                try {
                    this.isLoading = true;
                    await this.handleCreateAccount(form);
                    const date = new Date();
                    const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, date.getMinutes(), date.getSeconds(), date.getMilliseconds());
                    const room = await this.$api.room.createRoom({
                        name: form.roomName || date,
                        class_id: 0,
                        agora_room_uuid: '',
                        nest_less_region: 'sg',
                        started_at: date,
                        extra_data: {},
                        ended_at: endTime,
                    });
                    this.close();
                    this.$router.push(room.nano_id);
                } catch (error) {
                    console.log(error);
                    this.$handleError(error);
                } finally {
                    this.isLoading = false;
                }
            },
        },
    };
</script>

<style lang="scss" scoped>

</style>
