<template>
    <div class="flex justify-between bg-[#f8f8f8] min-h-screen">
        <div class="flex-grow flex flex-col h-screen overflow-x-hidden">
            <TheHeader />
            <div class="flex-grow overflow-hidden max-h-screen custom-scroll">
                <nuxt class=" p-4 m-3 md:m-6" />
            </div>
        </div>
    </div>
</template>

<script>
    import TheHeader from '@/components/layout/TheHeader.vue';

    export default {
        components: {
            TheHeader,
        },
    };
</script>
