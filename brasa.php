<?php 
$servidor = "localhost";
$usuario = "root";
$senha_bd = "";
$banco = "brasa";

$brasa = mysqli_connect($servidor, $usuario, $senha_bd, $banco);

if(!$brasa){
    die("Falha na conexão: " . mysqli_connect_error());
}

$nome = $_POST['nome'];
$email = $_POST['email'];
$telefone = $_POST['telefone'];
$endereco = $_POST['endereco'];
$bairro = $_POST['bairro'];
$cep = $_POST['cep'];
$tipo_pagamento = $_POST['tipo_pagamento'];
$numero_cartao = $_POST['numero_cartao'];
$validade = $_POST['validade'];
$cvv = $_POST['cvv'];


$sql = "insert into pedido (nome, email, telefone, endereco, bairro, cep, tipo_pagamento, numero_cartao, validade, cvv)
values ('$nome', '$email', '$telefone', '$endereco', '$bairro', '$cep', '$tipo_pagamento', '$numero_cartao', '$validade', '$cvv')";

if(mysqli_query($brasa, $sql)){
    echo "<h3> Pedido realizado com sucesso!</h3>";
    echo "<a href='index.html'>Voltar para página inicial</a>";
} else {
    echo "Erro ao realizar pedido: " . mysqli_error($brasa);
}

mysqli_close($brasa);
?>