<template>
    <div class="w-full bg-white border-gray-20 border-b live-class-header">
        <div
            class="container flex  items-center justify-between h-full py-3 gap-2 xs:justify-between xs:flex-nowrap"
        >
            <div class="flex items-center gap-4">
                <img src="/images/logo.png" alt="logo" @click="$router.go(-1)">
            </div>
            <h3 class="block overflow-hidden font-semibold w-52 whitespace-nowrap overflow-ellipsis">
                {{ getFullName }}
            </h3>
        </div>
    </div>
</template>
<script>
    export default {
        components: {
        },

        computed: {
            getFullName() {
                return this.$auth?.user?.full_name || '';
            },
        },

        methods: {
        },
    };
</script>
