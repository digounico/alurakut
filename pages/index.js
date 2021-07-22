import React from 'react';
import nookies from 'nookies';
import jwt from 'jsonwebtoken';
import MainGrid from '../src/components/MainGrid'
import Box from '../src/components/Box'
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from '../src/lib/AlurakutCommons'
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations';


function ProfileSideBar(propriedades) {
  return (
    <Box as="aside">
      <img src={`https://github.com/${propriedades.githubUser}.png`} style={{ borderRadius: '8px' }}></img>
      <hr />
      <p>
        <a className="boxLink" href={`https://github.com/${propriedades.githubUser}`}>
          @{propriedades.githubUser}
        </a>
      </p>
      <hr />
      <AlurakutProfileSidebarMenuDefault />
    </Box>
  )
}

function ProfileRelationsBox({ title, itens }) {
  return (
    <ProfileRelationsBoxWrapper>
      <h2 className="smallTitle">
        {title} ({itens.length})
      </h2>
      <ul>
        {
          itens.slice(0, 6).map((itemAtual) => {
            return (
              <li key={itemAtual.id}>
                <a href={itemAtual.url}>
                  <img src={itemAtual.imageUrl} />
                  <span>{itemAtual.title}</span>
                </a>
              </li>
            )
          })
        }
      </ul>
    </ProfileRelationsBoxWrapper>
  )
}

export default function Home(props) {

  const usuarioAleatorio = props.githubUser;

  const [comunidades, setComunidades] = React.useState([]);

  const pessoasFavoritas = [
    { id: 'juunegreiros', title: 'juunegreiros', imageUrl: 'https://github.com/juunegreiros.png', url: '/users/juunegreiros' },
    { id: 'omariosouto', title: 'omariosouto', imageUrl: 'https://github.com/omariosouto.png', url: '/users/omariosouto' },
    { id: 'peas', title: 'peas', imageUrl: 'https://github.com/peas.png', url: '/users/peas' },
    { id: 'rafaballerini', title: 'rafaballerini', imageUrl: 'https://github.com/rafaballerini.png', url: '/users/rafaballerini' },
    { id: 'marcobrunodev', title: 'marcobrunodev', imageUrl: 'https://github.com/marcobrunodev.png', url: '/users/marcobrunodev' },
    { id: 'felipefialho', title: 'felipefialho', imageUrl: 'https://github.com/felipefialho.png', url: '/users/felipefialho' },
    { id: 'mabarrio', title: 'mabarrio', imageUrl: 'https://github.com/mabarrio.png', url: '/users/mabarrio' }
  ];

  const [seguidores, setSeguidores] = React.useState([]);

  React.useEffect(function () {
    //GET - API Github
    fetch('https://api.github.com/users/peas/followers')
      .then((respostaDoServidor) => {
        return respostaDoServidor.json();
      })
      .then((respostaConvertida) => {
        // console.log(respostaConvertida);
        const seguidoresFetch = respostaConvertida.map((seguidor) => {
          return {
            id: seguidor.id,
            title: seguidor.login,
            imageUrl: seguidor.avatar_url,
            url: seguidor.url
          }
        });
        setSeguidores(seguidoresFetch)
      })

    // POST - API GraphQL
    fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Authorization': 'f5b950255e0ca81eb5c50698090188',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        "query": `query {
        allCommunities {
          id
          title
          imageUrl
          creatorSlug
        }
      }`})
    })
      .then((response) => response.json())
      .then((respostaCompleta) => {
        const comunidadesVindasDoDatoCMS = respostaCompleta.data.allCommunities
          .map((comunidade) => {
            return {
              id: comunidade.id,
              title: comunidade.title,
              imageUrl: comunidade.imageUrl,
              url: ''
            }
          });
        setComunidades(comunidadesVindasDoDatoCMS);
      })

  }, []);


  return (
    <>
      <AlurakutMenu githubUser={usuarioAleatorio} />
      <MainGrid>
        <div className="profileArea" style={{ gridArea: 'profileArea' }}>
          <ProfileSideBar githubUser={usuarioAleatorio} />
        </div>
        <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
          <Box>
            <h1 className="title">
              Bem Vindo(a)
            </h1>
            <OrkutNostalgicIconSet />
          </Box>
          <Box>
            <h2>O que você deseja fazer?</h2>
            <form onSubmit={function handleCriaComunidade(e) {
              e.preventDefault();
              const dadosDoForm = new FormData(e.target);

              const comunidade = {
                title: dadosDoForm.get('title'),
                imageUrl: dadosDoForm.get('image'),
                creatorSlug: usuarioAleatorio,
              }

              fetch('api/comunidades', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(comunidade)
              })
                .then(async (response) => {
                  const dados = await response.json();
                  // console.log(dados.registroCriado);
                  setComunidades([...comunidades, dados.registroCriado]);
                })
            }}>
              <div>
                <input
                  placeholder="Qual vai ser o nome da sua comunidade?"
                  name="title"
                  aria-label="Qual vai ser o nome da sua comunidade?"
                  type="text"
                />
              </div>
              <div>
                <input
                  placeholder="Coloque uma URL para usarmos de capa"
                  name="image"
                  aria-label="Coloque uma URL para usarmos de capa"
                />
              </div>
              <button>
                Criar Comunidade
              </button>
            </form>
          </Box>
        </div>
        <div className="profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>
          <ProfileRelationsBox title="Seguidores" itens={seguidores} />
          <ProfileRelationsBox title="Comunidades" itens={comunidades} />
          <ProfileRelationsBox title="Pessoas da Comunidade" itens={pessoasFavoritas} />
        </div>
      </MainGrid>
    </>
  );
}

// Tipo um Intercept que roda no lado do servidor
export async function getServerSideProps(context) {
  console.log("Roda no Servidor");

  const cookies = nookies.get(context);
  const token = cookies.USER_TOKEN;

  const { isAuthenticated } = await fetch('https://alurakut.vercel.app/api/auth', {
    headers: {
      Authorization: token
    }
  })
    .then((resposta) => resposta.json());
  if (!isAuthenticated) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  const { githubUser } = jwt.decode(token);
  return {
    props: {
      githubUser
    },
  }
}
