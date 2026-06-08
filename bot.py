import discord
from discord.ext import commands
from discord import app_commands
import json
import os

class ModalFuncional(discord.ui.Modal, title="Solicitar Funcional"):
    personagem = discord.ui.TextInput(label="Nome do Personagem", placeholder="Ex: João Silva", required=True)
    idade = discord.ui.TextInput(label="Idade", placeholder="Ex: 25", required=True, max_length=3)
    passaporte = discord.ui.TextInput(label="Passaporte", placeholder="Ex: 16346", required=True, max_length=10)
    guarnicao = discord.ui.TextInput(label="Guarnição", placeholder="Ex: GER - DOPE", required=True)
    patente = discord.ui.TextInput(label="Patente Solicitada", placeholder="Ex: Agente 3° Classe", required=True)

    async def on_submit(self, interaction: discord.Interaction):
        embed = discord.Embed(
            title="Registro Policial",
            description="Você recebeu uma nova solicitação de registro.",
            color=0x000000
        )
        embed.add_field(name="Personagem:", value=f"```{self.personagem.value}```", inline=True)
        embed.add_field(name="Idade:", value=f"```{self.idade.value} anos```", inline=True)
        embed.add_field(name="Passaporte:", value=f"```{self.passaporte.value}```", inline=True)
        embed.add_field(name="Guarnição:", value=f"```{self.guarnicao.value}```", inline=False)
        embed.add_field(name="Patente Solicitada:", value=f"```{self.patente.value}```", inline=False)
        embed.add_field(name="Info Registro:", value="• Selecione abaixo a ação desejada.", inline=False)

        view = ViewRegistro()
        await interaction.response.send_message(embed=embed, view=view, ephemeral=True)


class BotaoSolicitar(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="Solicitar Funcional", style=discord.ButtonStyle.secondary, custom_id="solicitar_funcional")
    async def solicitar(self, interaction: discord.Interaction, button: discord.ui.Button):
        modal = ModalFuncional()
        await interaction.response.send_modal(modal)


class ViewRegistro(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="Aprovar", style=discord.ButtonStyle.success, custom_id="aprovar_registro")
    async def aprovar(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_message("✅ Registro aprovado!", ephemeral=True)

    @discord.ui.button(label="Recusar", style=discord.ButtonStyle.danger, custom_id="recusar_registro")
    async def recusar(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_message("❌ Registro recusado.", ephemeral=True)


class Bot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        super().__init__(command_prefix="!", intents=intents)

    async def setup_hook(self):
        self.add_view(BotaoSolicitar())
        self.add_view(ViewRegistro())
        await self.tree.sync()


bot = Bot()

@bot.event
async def on_ready():
    print(f"Bot logado como {bot.user} (ID: {bot.user.id})")
    print("------")

@bot.tree.command(name="solicitar", description="Enviar mensagem para solicitar funcional")
async def solicitar(interaction: discord.Interaction):
    embed = discord.Embed(
        title="Secretária de Segurança Pública – Solicite Sua Funcional",
        description=(
            "Para solicitar sua funcional de forma prática e eficiente, basta "
            "clicar no botão abaixo. Este processo foi implementado para "
            "facilitar e melhorar sua experiência em nossa cidade."
        ),
        color=0x000000
    )
    embed.set_footer(text="Segurança Pública – SAMPA RP – Solicite Sua Funcional")

    view = BotaoSolicitar()
    await interaction.channel.send(embed=embed, view=view)
    await interaction.response.send_message("✅ Mensagem enviada!", ephemeral=True)

@bot.tree.command(name="limpar", description="Limpar mensagens do canal")
@app_commands.checks.has_permissions(manage_messages=True)
async def limpar(interaction: discord.Interaction, quantidade: int = 10):
    await interaction.channel.purge(limit=quantidade)
    await interaction.response.send_message(f"🧹 {quantidade} mensagens limpas!", ephemeral=True)

with open("config.json") as f:
    config = json.load(f)

bot.run(config["token"])
