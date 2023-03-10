import { GithubUser } from "./GithubUser.js";

//classe que vai conter a logica dos dados
//como os dados serao estruturados
export class Favorites{
  constructor(root){
    this.root = document.querySelector(root);
    this.load()
  }

  load(){
    this.entries = JSON.parse(localStorage.getItem('@github-favorites')) || []
  }

  save() {
    localStorage.setItem('@github-favorites', JSON.stringify(this.entries))

  }

  //função assíncrona - promessa
  async add(username){
    try{
      const userExists = this.entries.find(entry => entry.login.toLowerCase() === username.toLowerCase())

      if(userExists){
        throw new Error("Usuário já cadastrado")
      }


      const user = await GithubUser.search(username)

      if(user.name === undefined){
        throw new Error('Usuário não encontrado!') 
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }
  
  }

  //funçao para deletar os dados da tela
  delete(user) {
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login)
      
    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

// classe que vai criar a visualizaçao e eventos do HTML
export class FavoritesView extends Favorites{
  constructor(root){
    super(root);

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      let inputEntries  = this.root.querySelector('.search input')
    
      this.add(inputEntries.value)

      
      inputEntries.value = ""
    }
  }

  //preenchimento do conteudo
  update(){
    this.removeAllTr()
    this.isEmpty()
   
   
    this.entries.forEach ( user => {
      const row = this.createRow()
     
      row.querySelector('.user img').src=`https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => { 
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')
        if(isOk){
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
 
  }

  isEmpty() {
    if (this.entries.length == 0) {
      const tr = document.createElement('tr')

      tr.innerHTML = `
      <td colspan="4">
        <div class="emptyFav">
          <img src="./assets/estrela.svg" />
          Nenhum favorito ainda
        </div>
      </td>
      `

      this.tbody.append(tr)
    }
  }

  //criaçao dos elemntos
  createRow() {
    const tr = document.createElement("tr")

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/maykbrito.png" alt="Imagem de maybrito">
        <a href="https://github.com/maykbrito" target="_blank">
          <p>Mayk Brito</p>
          <span>maykbrito</span>
        </a>
      </td>
      <td class="repositories">
        76
      </td>
      <td class="followers">
        9589
      </td>
      <td>
        <button class="remove">Remover</button>
      </td>
    `
    return tr
  }

  removeAllTr(){
   

    this.tbody.querySelectorAll('tr')
      .forEach((tr)=> {
        tr.remove()
      })
  } 
}