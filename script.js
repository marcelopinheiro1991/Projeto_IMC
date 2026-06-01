function classificarIMC(imc){

    if(imc < 18.5){
        return { texto: "Magreza", classe: "saude-baixo" };
    }
    else if(imc < 25){
        return { texto: "Saudável", classe: "saude-normal" };
    }
    else if(imc < 30){
        return { texto: "Sobrepeso", classe: "saude-atencao" };
    }
    else if(imc < 40){
        return { texto: "Obesidade", classe: "saude-risco" };
    }
    else{
        return { texto: "Obesidade Grave", classe: "saude-risco" };
    }
}

function fraseIncentivo(imc){

    if(imc < 18.5){
        return "Você está abaixo do ideal. Foque em alimentação e constância 🥗";
    }
    else if(imc < 25){
        return "Excelente! Continue assim, você está no caminho certo 💪";
    }
    else if(imc < 30){
        return "Atenção! Pequenas mudanças já vão trazer resultados 🔥";
    }
    else if(imc < 35){
        return "Hora de foco total! Disciplina vai transformar seus resultados ⚡";
    }
    else{
        return "Não desista! Comece aos poucos e mantenha constância 🏃‍♂️";
    }
}

function calcularIMC(){

    let nome = document.getElementById("nome").value;
    let mes = document.getElementById("mes").value;

    let peso = parseFloat(document.getElementById("peso").value);
    let altura = parseFloat(document.getElementById("altura").value);

    if(!nome || !mes || !peso || !altura){
        alert("Preencha todos os campos!");
        return;
    }

    let imc = peso / (altura * altura);

    let resultado = classificarIMC(imc);
    let classificacao = resultado.texto;
    let classeCard = resultado.classe;

    let alunos = JSON.parse(localStorage.getItem("alunos")) || [];

    let aluno = alunos.find(a => a.nome.toLowerCase() === nome.toLowerCase());

    let registro = {
        mes,
        peso,
        altura,
        imc: imc.toFixed(2),
        classificacao
    };

    if(aluno){
        aluno.historico.push(registro);
    } else {
        alunos.push({
            nome,
            historico: [registro]
        });
    }

    localStorage.setItem("alunos", JSON.stringify(alunos));

    document.getElementById("resultado").innerHTML = `
        <div class="card ${classeCard}">
            <p><b>Aluno:</b> ${nome}</p>
            <p><b>IMC:</b> ${imc.toFixed(2)}</p>
            <p><b>Situação:</b> ${classificacao}</p>
            <p><b>Mensagem:</b> ${fraseIncentivo(imc)}</p>
        </div>
    `;
}

function listarAlunos(){

    let alunos = JSON.parse(localStorage.getItem("alunos")) || [];

    let html = "";

    alunos.forEach(aluno => {

        let ultimo = aluno.historico[aluno.historico.length - 1];
        let resultado = classificarIMC(parseFloat(ultimo.imc));

        html += `<div class="card ${resultado.classe}">
            <h3>${aluno.nome}</h3>`;

        aluno.historico.forEach((h, index) => {

            html += `
                <p>
                    ${h.mes} - IMC: ${h.imc} (${h.classificacao})
                </p>

                <button onclick="editarRegistro('${aluno.nome}', ${index})">
                    Editar
                </button>

                <button onclick="removerRegistro('${aluno.nome}', ${index})">
                    Excluir
                </button>
            `;
        });

        html += `
            <button onclick="removerAluno('${aluno.nome}')">
                Excluir Aluno
            </button>
        </div>`;
    });

    document.getElementById("resultado").innerHTML = html;
}

function removerAluno(nome){

    let alunos = JSON.parse(localStorage.getItem("alunos")) || [];

    alunos = alunos.filter(a => a.nome !== nome);

    localStorage.setItem("alunos", JSON.stringify(alunos));

    listarAlunos();
}

function removerRegistro(nome, index){

    let alunos = JSON.parse(localStorage.getItem("alunos")) || [];

    let aluno = alunos.find(a => a.nome === nome);

    if(aluno){
        aluno.historico.splice(index, 1);
    }

    localStorage.setItem("alunos", JSON.stringify(alunos));

    listarAlunos();
}

function editarRegistro(nome, index){

    let alunos = JSON.parse(localStorage.getItem("alunos")) || [];

    let aluno = alunos.find(a => a.nome === nome);

    if(!aluno) return;

    let registro = aluno.historico[index];

    let novoPeso = prompt("Novo peso:", registro.peso);
    let novaAltura = prompt("Nova altura:", registro.altura);

    if(novoPeso === null || novaAltura === null) return;

    novoPeso = parseFloat(novoPeso);
    novaAltura = parseFloat(novaAltura);

    let imc = novoPeso / (novaAltura * novaAltura);

    registro.peso = novoPeso;
    registro.altura = novaAltura;
    registro.imc = imc.toFixed(2);

    let resultado = classificarIMC(imc);
    registro.classificacao = resultado.texto;

    localStorage.setItem("alunos", JSON.stringify(alunos));

    listarAlunos();
}

function buscarAluno(){

    let busca = document.getElementById("busca").value.toLowerCase();

    let alunos = JSON.parse(localStorage.getItem("alunos")) || [];

    let html = "";

    alunos.forEach(aluno => {

        if(aluno.nome.toLowerCase().includes(busca)){

            html += `<div class="card"><h3>${aluno.nome}</h3>`;

            aluno.historico.forEach(h => {
                html += `<p>${h.mes} - IMC: ${h.imc}</p>`;
            });

            html += `</div>`;
        }
    });

    document.getElementById("resultado").innerHTML = html;
}

function gerarGrafico(){

    let busca = document.getElementById("busca").value.toLowerCase();

    let alunos = JSON.parse(localStorage.getItem("alunos")) || [];

    let aluno = alunos.find(a => a.nome.toLowerCase() === busca);

    if(!aluno){
        document.getElementById("resultado").innerHTML =
        "<p>Aluno não encontrado</p>";
        return;
    }

    let meses = [];
    let imcs = [];

    aluno.historico.forEach(h => {
        meses.push(h.mes);
        imcs.push(h.imc);
    });

    let ctx = document.getElementById("graficoIMC").getContext("2d");

    if(window.grafico){
        window.grafico.destroy();
    }

    window.grafico = new Chart(ctx, {
        type: "line",
        data: {
            labels: meses,
            datasets: [{
                label: "Evolução IMC - " + aluno.nome,
                data: imcs,
                borderWidth: 3
            }]
        }
    });

    let ultimoIMC = imcs[imcs.length - 1];

    document.getElementById("resultado").innerHTML = `
        <div class="card">
            <h3>${aluno.nome}</h3>
            <p><b>Último IMC:</b> ${ultimoIMC}</p>
            <p><b>Mensagem:</b> ${fraseIncentivo(ultimoIMC)}</p>
        </div>
    `;
}

function limparAlunos(){

    localStorage.removeItem("alunos");

    document.getElementById("resultado").innerHTML =
    "<p>Todos os dados foram removidos</p>";

    if(window.grafico){
        window.grafico.destroy();
    }
}