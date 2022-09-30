<template>
    <a-modal
        v-model="visible"
        title="Tạo tài khoản"
        :footer="false"
        @cancel="close"
    >
        <Form @submit="handleCreateAccount" />
    </a-modal>
</template>

<script>
    import Form from '@/components/auth/form/Login.vue';

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
            async handleCreateAccount(form) {
                try {
                    await this.$auth.loginWith('local', {
                        data: {
                            full_name: form?.fullName || '',
                            role: 'HOST',
                        },
                    });
                    this.$emit('logined');
                    this.close();
                } catch (error) {
                    console.log(error);
                }
            },

            open() {
                this.visible = true;
            },

            close() {
                this.visible = false;
            },

        },
    };
</script>

<style lang="scss" scoped>

</style>
