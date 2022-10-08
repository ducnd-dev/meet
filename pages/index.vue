<template>
    <div class="home">
        <div class="container">
            <div class="flex items-center h-full">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-32">
                    <div class="flex flex-col gap-8">
                        <h2 class=" text-3xl lg:text-5xl font-semibold">
                            Cuộc họp video chất lượng cao cho tất cả mọi người
                        </h2>
                        <p class="text-sm">
                            Khách được mời có thể tham gia hội nghị truyền hình trực tuyến từ máy tính bằng bất kỳ trình duyệt web hiện đại nào mà không cần cài đặt phần mềm.
                        </p>

                        <div class="flex flex-wrap lg:flex-nowrap gap-2 ">
                            <a-button type="primary" size="large" @click="createRoom">
                                Tạo cuộc họp
                            </a-button>
                            <a-input
                                v-model="roomName"
                                size="large"

                                placeholder="Nhập mã hoặc đường liên kết"
                            >
                                <template slot="prepend">
                                    <i class="far fa-keyboard" />
                                </template>
                            </a-input>
                            <span class=" ">
                                <a
                                    v-if="roomName"
                                    :href="roomName"
                                    class="flex items-center justify-center a-button rounded-md font-semibold text-blue-500 opacity-30 w-full h-full"
                                    :class="roomName ? 'hover:bg-blue-200 hover:opacity-100' : ''"
                                >
                                    Tham gia
                                </a>
                            </span>
                        </div>
                    </div>
                    <div class="flex justify-center">
                        <a-carousel indicator-position="outside" class="carousa-meet" arrow="never">
                            <div v-for="item in 4" :key="item">
                                <div class="flex justify-center items-center h-full w-full">
                                    <img :src="`/images/home/pic${item}.png`" class="w-full h-full object-cover">
                                </div>
                            </div>
                        </a-carousel>
                    </div>
                </div>
            </div>
        </div>
        <CreateRoomModal ref="createModal" />
    </div>
</template>
<script>
    import CreateRoomModal from '@/components/home/modal/CreateRoom.vue';

    export default {
        components: {
            CreateRoomModal,
        },

        data() {
            return {
                roomName: '',
            };
        },

        methods: {
            createRoom() {
                this.$refs.createModal.open();
            },
        },
    };
</script>
<style lang="scss">
    .home {
        height: calc(100vh - 100px);
        .carousa-meet {
            width: 400px;
            .a-carousel__container{
                .a-carousel__item {
                    display: flex;
                    justify-content: center;
                    img {
                        width: 300px;
                        @media (max-width: 374px) {
                            width: 280px;
                            height: 280px;
                        }
                    }
                }
            }
            .a-carousel__indicators--outside {
                > li {
                    .a-carousel__button {
                        width: 5px;
                        height: 5px;
                        border-radius: 50%;
                    }
                }
            }
        }
    }
</style>
