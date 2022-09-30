<template>
    <a-form-model
        ref="form"
        layout="vertical"
        :model="form"
        :rules="rules"
    >
        <a-form-model-item label="Họ và tên" prop="fullName">
            <a-input v-model="form.fullName" placeholder="input placeholder" />
        </a-form-model-item>
        <a-form-model-item label="Tên phòng">
            <a-input v-model="form.roomName" placeholder="input placeholder" />
        </a-form-model-item>
        <a-form-model-item>
            <a-button type="primary" size="large" @click="submit">
                Tạo phòng
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
            };
        },

        mounted() {

        },

        methods: {
            submit() {
                this.$refs.form?.validate((valid) => {
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
