// export async function load({ params, locals }) {

//     const notes = (
//         await locals.pb.collection('notes').getList(1, 50, {
//             sort: 'created',
//         })
//     ).items;

//     const folders = await locals.pb.collection('folders').getFullList();


//     return {
//         notes, folders
//     }
// }
