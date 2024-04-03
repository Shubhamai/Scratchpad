import { error } from '@sveltejs/kit';

export async  function load({ params, locals }) {

    const { slug } = params;
    const record = await locals.pb.collection('notes').getOne(slug);
    
    if (!record) {
        throw error(404, `Note not found`);
    }

    return {
        record
    };
}
