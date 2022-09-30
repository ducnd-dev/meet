import Room from '@/api/room';

export default (context, inject) => {
    // Initialize API factories
    const factories = {
        room: Room(context.$axios),
    };

    // Inject $api
    inject('api', factories);
};
