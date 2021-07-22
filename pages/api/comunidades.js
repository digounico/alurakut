import { SiteClient } from 'datocms-client';

export default async function recebedorDeRequests(request, response) {
    if (request.method === 'POST') {
        const TOKEN = '151a596d15153d6392c2b92fefc398';
        const client = new SiteClient(TOKEN);

        const registroCriado = await client.items.create({
            itemType: "975435", //Model ID
            ...request.body
            //title: 'Algum Titulo',
            //imageUrl: 'Alguma URL',
            //creatorSlug: 'Nome Criador',
        });
        console.log(registroCriado);

        response.json({
            dados: 'Algum dado qualquer',
            registroCriado: registroCriado,
        });
        return;
    }

    response.status(404).json({
        message: 'Ainda não temos nada no GET, mas no POST tem!'
    })
}