import Room from '@/api/room';
import User from '@/api/user';

export default (context, inject) => {
    // Initialize API factories
    const factories = {
        room: Room(context.$axios),
        user: User(context.$axios),
    };

    // Inject $api
    inject('api', factories);
};
