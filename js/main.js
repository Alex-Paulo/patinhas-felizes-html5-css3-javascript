// ======================================================
// 🐾 ONG PATINHAS FELIZES - main.js (SPA Version)
// Funções: SPA Router | Máscaras | Validação | LocalStorage
// ======================================================

// --- BLOCO 1: LÓGICA DO SPA (ROTEAMENTO) ---

const mainContent = document.getElementById('app-content');
const navLinks = document.querySelectorAll('a.nav-link');

// Função para carregar o conteúdo da página via Fetch
async function loadPage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Página não encontrada.');
    }
    const pageHtml = await response.text();
    mainContent.innerHTML = pageHtml;

    // Se a página de cadastro foi carregada, inicialize seus scripts
    if (url.includes('cadastro.html')) {
      initCadastroScripts();
    }
  } catch (error) {
    mainContent.innerHTML = `<p style="text-align: center; color: red;">Erro ao carregar a página. Tente novamente.</p>`;
    console.error('Erro no fetch:', error);
  }
}

// Adiciona o evento de clique a todos os links de navegação
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault(); // Impede a navegação padrão
    const url = e.target.getAttribute('href');
    loadPage(url);
  });
});

// Carrega a página inicial por padrão ao abrir o site
window.addEventListener('DOMContentLoaded', () => {
  loadPage('pages/inicio.html');
});

// --- BLOCO 2: SCRIPTS DA PÁGINA DE CADASTRO ---

// Esta função SÓ será chamada quando a página de cadastro for carregada
function initCadastroScripts() {
  const formCadastro = document.getElementById('formCadastro');
  if (!formCadastro) return; // Segurança extra

  // --- Funções de Máscara ---
  const mascaraCPF = (input) => {
    input.value = input.value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };
  const mascaraTelefone = (input) => {
    input.value = input.value.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d{4})$/, '$1-$2');
  };
  const mascaraCEP = (input) => {
    input.value = input.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2');
  };

  // --- Conectar máscaras e Flatpickr ---
  document.getElementById('cpf').addEventListener('input', e => mascaraCPF(e.target));
  document.getElementById('telefone').addEventListener('input', e => mascaraTelefone(e.target));
  document.getElementById('cep').addEventListener('input', e => mascaraCEP(e.target));
  
  flatpickr('#nascimento', {
    locale: 'pt',
    dateFormat: 'd/m/Y',
  });

  // --- Validação do Formulário e LocalStorage ---
  formCadastro.addEventListener('submit', function(e) {
    e.preventDefault();
    const erros = [];
    const getVal = (id) => formCadastro.querySelector(id).value.trim();
    
    if (getVal('#nome').length < 3) erros.push('Nome inválido.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(getVal('#email'))) erros.push('E-mail inválido.');
    if (getVal('#cpf').replace(/\D/g, '').length !== 11) erros.push('CPF inválido.');
    if (getVal('#telefone').replace(/\D/g, '').length < 10) erros.push('Telefone inválido.');
    if (getVal('#nascimento') === '') erros.push('Data de nascimento obrigatória.');
    if (getVal('#cep').replace(/\D/g, '').length !== 8) erros.push('CEP inválido.');
    if (getVal('#cidade') === '') erros.push('Cidade é obrigatória.');
    if (getVal('#estado') === '') erros.push('Estado é obrigatório.');

    if (erros.length > 0) {
      alert('Por favor, corrija os erros:\n\n' + erros.join('\n'));
      return;
    }

    // Salvar no localStorage
    try {
      const voluntarios = JSON.parse(localStorage.getItem('voluntarios') || '[]');
      voluntarios.push({
        nome: getVal('#nome'), email: getVal('#email'), cpf: getVal('#cpf'),
        telefone: getVal('#telefone'), nascimento: getVal('#nascimento'),
        cep: getVal('#cep'), cidade: getVal('#cidade'), estado: getVal('#estado'),
        criadoEm: new Date().toISOString()
      });
      localStorage.setItem('voluntarios', JSON.stringify(voluntarios));
      alert('Cadastro salvo com sucesso! Obrigado.');
      formCadastro.reset();
    } catch (err) {
      console.error("Erro ao salvar no LocalStorage:", err);
      alert('Ocorreu um erro ao salvar seu cadastro.');
    }
  });
}
