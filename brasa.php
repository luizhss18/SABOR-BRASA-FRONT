<?php
$servidor = "localhost";
$usuario = "root";
$senha_bd = "";
$banco = "brasa";

$brasa = mysqli_connect($servidor, $usuario, $senha_bd, $banco);

if (!$brasa) {
    http_response_code(500);
    die("Não foi possível conectar ao banco de dados.");
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: pagamento.html");
    exit;
}

$nome = trim($_POST["nome"] ?? "");
$email = trim($_POST["email"] ?? "");
$telefone = trim($_POST["telefone"] ?? "");
$endereco = trim($_POST["endereco"] ?? "");
$bairro = trim($_POST["bairro"] ?? "");
$cep = trim($_POST["cep"] ?? "");
$tipo_pagamento = trim($_POST["tipo_pagamento"] ?? "");

$campos = [$nome, $email, $telefone, $endereco, $bairro, $cep, $tipo_pagamento];

if (in_array("", $campos, true)) {
    http_response_code(400);
    $erro = "Confira os campos do formulário e tente novamente.";
} else {
    $sql = "INSERT INTO pedido (nome, email, telefone, endereco, bairro, cep, tipo_pagamento)
            VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmt = mysqli_prepare($brasa, $sql);

    if ($stmt) {
        mysqli_stmt_bind_param(
            $stmt,
            "sssssss",
            $nome,
            $email,
            $telefone,
            $endereco,
            $bairro,
            $cep,
            $tipo_pagamento
        );

        if (mysqli_stmt_execute($stmt)) {
            $pedido_id = mysqli_insert_id($brasa);
            $sucesso = true;
        } else {
            http_response_code(500);
            $erro = "Não foi possível registrar seu pedido. Tente novamente.";
        }

        mysqli_stmt_close($stmt);
    } else {
        http_response_code(500);
        $erro = "Não foi possível preparar o registro do pedido.";
    }
}

$nome_exibicao = htmlspecialchars($nome, ENT_QUOTES, "UTF-8");
$pagamento_exibicao = htmlspecialchars(ucfirst($tipo_pagamento), ENT_QUOTES, "UTF-8");

mysqli_close($brasa);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo !empty($sucesso) ? "Pedido confirmado" : "Não foi possível concluir"; ?> | Brasa Burger</title>
    <style>
        :root {
            color-scheme: dark;
            --fundo: #11100f;
            --card: #1b1917;
            --card-topo: #302820;
            --texto: #f4ead7;
            --suave: #b9aa94;
            --laranja: #e74721;
            --laranja-claro: #ff9c28;
            --borda: rgba(244, 234, 215, .12);
            --detalhes: rgba(0, 0, 0, .18);
            --sombra: rgba(0, 0, 0, .38);
        }
        body[data-tema="claro"] {
            color-scheme: light;
            --fundo: #f4ead7;
            --card: #fffaf1;
            --card-topo: #fffdf8;
            --texto: #29231e;
            --suave: #75685b;
            --borda: rgba(41, 35, 30, .14);
            --detalhes: rgba(185, 170, 148, .16);
            --sombra: rgba(68, 48, 30, .13);
        }
        * { box-sizing: border-box; }
        body {
            min-height: 100vh;
            margin: 0;
            padding: 28px 18px;
            display: grid;
            place-items: center;
            background:
                radial-gradient(ellipse at 50% 0%, rgba(231, 71, 33, .18), transparent 48%),
                var(--fundo);
            color: var(--texto);
            font-family: "DM Sans", Arial, sans-serif;
        }
        .confirmacao {
            width: min(100%, 560px);
            padding: 42px 36px;
            text-align: center;
            background: linear-gradient(145deg, var(--card-topo) 0%, var(--card) 78%);
            border: 1px solid var(--borda);
            border-radius: 22px;
            box-shadow: 0 24px 80px var(--sombra);
            transition: background .25s ease, color .25s ease, border-color .25s ease, box-shadow .25s ease;
        }
        .marca {
            margin: 0 0 28px;
            color: var(--laranja-claro);
            font-family: Georgia, serif;
            font-size: 15px;
            letter-spacing: 3px;
            text-transform: uppercase;
        }
        .icone {
            width: 76px;
            height: 76px;
            display: grid;
            place-items: center;
            margin: 0 auto 22px;
            border: 1px solid rgba(91, 190, 125, .35);
            border-radius: 50%;
            background: rgba(91, 190, 125, .12);
            color: #75d69a;
            font-size: 38px;
        }
        h1 {
            margin: 0 0 12px;
            font-family: Georgia, serif;
            font-size: clamp(30px, 7vw, 42px);
            font-weight: 600;
        }
        .descricao {
            margin: 0 auto 28px;
            max-width: 410px;
            color: var(--suave);
            line-height: 1.7;
        }
        .detalhes {
            margin: 0 0 28px;
            padding: 20px;
            text-align: left;
            background: var(--detalhes);
            border: 1px solid var(--borda);
            border-radius: 14px;
        }
        .linha {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            padding: 9px 0;
            color: var(--suave);
            font-size: 14px;
        }
        .linha + .linha { border-top: 1px solid var(--borda); }
        .linha strong {
            color: var(--texto);
            text-align: right;
            overflow-wrap: anywhere;
        }
        .status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 24px;
            padding: 9px 14px;
            border-radius: 999px;
            background: rgba(91, 190, 125, .12);
            color: #91e0ad;
            font-size: 13px;
            font-weight: 700;
        }
        .botao {
            display: inline-block;
            width: 100%;
            padding: 15px 22px;
            border: 0;
            border-radius: 10px;
            background: linear-gradient(100deg, var(--laranja), var(--laranja-claro));
            color: #fff;
            font-size: 15px;
            font-weight: 800;
            text-decoration: none;
            transition: transform .2s ease, filter .2s ease;
        }
        .botao:hover { transform: translateY(-2px); filter: brightness(1.08); }
        .alternar-tema {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 46px;
            height: 46px;
            display: grid;
            place-items: center;
            border: 1px solid var(--borda);
            border-radius: 50%;
            background: var(--card);
            color: var(--texto);
            font-size: 21px;
            cursor: pointer;
            box-shadow: 0 5px 20px var(--sombra);
            transition: transform .2s ease, background .25s ease, color .25s ease;
        }
        .alternar-tema:hover { transform: translateY(-2px); }
        .aviso-erro .icone {
            border-color: rgba(231, 71, 33, .35);
            background: rgba(231, 71, 33, .12);
            color: var(--laranja-claro);
        }
        @media (max-width: 480px) {
            .alternar-tema { top: 12px; right: 12px; width: 42px; height: 42px; }
            .confirmacao { padding: 34px 22px; }
            .detalhes { padding: 16px; }
        }
    </style>
</head>
<body>
    <button class="alternar-tema" type="button" id="alternar-tema" aria-label="Ativar modo claro" title="Ativar modo claro">☾</button>
    <main class="confirmacao <?php echo empty($sucesso) ? "aviso-erro" : ""; ?>">
        <p class="marca">Sabor &amp; Brasa</p>

        <?php if (!empty($sucesso)): ?>
            <div class="icone" aria-hidden="true">✓</div>
            <h1>Pedido confirmado!</h1>
            <p class="descricao">
                <?php echo $nome_exibicao; ?>, recebemos seu pedido com sucesso.
                Agora é só aguardar: estamos preparando tudo com aquele cuidado especial da Brasa.
            </p>

            <span class="status">✓ Pedido registrado</span>

            <section class="detalhes" aria-label="Detalhes do pedido">
                <?php if (!empty($pedido_id)): ?>
                    <div class="linha">
                        <span>Número do pedido</span>
                        <strong>#<?php echo (int) $pedido_id; ?></strong>
                    </div>
                <?php endif; ?>
                <div class="linha">
                    <span>Cliente</span>
                    <strong><?php echo $nome_exibicao; ?></strong>
                </div>
                <div class="linha">
                    <span>Pagamento</span>
                    <strong><?php echo $pagamento_exibicao; ?></strong>
                </div>
            </section>

            <a class="botao" href="index.html">Voltar para o início</a>
        <?php else: ?>
            <div class="icone" aria-hidden="true">!</div>
            <h1>Não foi dessa vez</h1>
            <p class="descricao">
                <?php echo htmlspecialchars($erro ?? "Ocorreu um problema ao registrar seu pedido.", ENT_QUOTES, "UTF-8"); ?>
                Seus dados não foram confirmados. Volte ao pagamento e tente novamente.
            </p>
            <a class="botao" href="pagamento.html">Voltar ao pagamento</a>
        <?php endif; ?>
    </main>

    <script>
        const botaoTema = document.getElementById("alternar-tema");
        const temaSalvo = localStorage.getItem("brasa-tema-confirmacao");

        if (temaSalvo === "claro") {
            document.body.setAttribute("data-tema", "claro");
            botaoTema.textContent = "☀";
            botaoTema.setAttribute("aria-label", "Ativar modo escuro");
            botaoTema.title = "Ativar modo escuro";
        }

        botaoTema.addEventListener("click", () => {
            const modoClaro = document.body.getAttribute("data-tema") !== "claro";

            if (modoClaro) {
                document.body.setAttribute("data-tema", "claro");
                botaoTema.textContent = "☀";
                botaoTema.setAttribute("aria-label", "Ativar modo escuro");
                botaoTema.title = "Ativar modo escuro";
                localStorage.setItem("brasa-tema-confirmacao", "claro");
            } else {
                document.body.removeAttribute("data-tema");
                botaoTema.textContent = "☾";
                botaoTema.setAttribute("aria-label", "Ativar modo claro");
                botaoTema.title = "Ativar modo claro";
                localStorage.setItem("brasa-tema-confirmacao", "escuro");
            }
        });
    </script>
</body>
</html>
