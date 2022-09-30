<template>
    <a-form-model
        ref="form"
        layout="vertical"
        :model="form"
        :rules="rules"
    >
        <a-form-model-item label="Họ và tên" prop="fullName">
            <a-input v-model="form.fullName" placeholder="Họ và tên" />
        </a-form-model-item>
        <a-form-model-item>
            <a-button
                :loading="isLoading"
                type="primary"
                size="large"
                @click="submit"
            >
                Xác nhận
            </a-button>
        </a-form-model-item>
    </a-form-model>
</template>

<script>
    const defaultForm = {
        fullName: undefined,
        roomName: undefined,
        role: 'HOST',
    };
    export default {
        name: 'MeetCreateRoom',

        data() {
            return {
                form: { ...defaultForm },
                rules: {
                    fullName: [{ required: true, message: 'Vui lòng nhập họ tên', trigger: ['change', 'blur'] }],
                },
                isLoading: false,
            };
        },

        mounted() {

        },

        methods: {
            submit() {
                this.$refs.form?.validate(async (valid) => {
                    if (valid) {
                        this.$emit('submit', this.form);
                    }
                });
            },
        },
    };
</script>

<style lang="scss" scoped>

</style>
