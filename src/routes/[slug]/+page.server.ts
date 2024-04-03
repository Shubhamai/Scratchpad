import { redirect } from '@sveltejs/kit';

export async function load({ params, locals }) {
	const { slug } = params;

	try {
		const record = await locals.pb.collection('notes').getOne(slug);
		return { record };
	} catch (e : any) {
		console.log(e.message);
        
        // TODO - redirect or 404 ?
		throw redirect(301, '/');
	}
}
