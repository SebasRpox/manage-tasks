import React, { Component } from 'react';
import 'whatwg-fetch';
//MomentJS para formatear la fecha de vencimiento
import moment from "moment";
//LocalStorage
import { getFromStorage, setInStorage } from "../../utils/storage";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      token: "",
      signUpError: "",
      signInError: "",
      signInEmail: "",
      signInPassword: "",
      signUpFirstName: "",
      signUpLastName: "",
      signUpEmail: "",
      signUpPassword: "",
      title: "",
      description: "",
      tasks: [],
      _id: "",
      priority: "",
      date: moment().format('YYYY-MM-DD')
    }
    this.onChangeSignInEmail = this.onChangeSignInEmail.bind(this);
    this.onChangeSignInPassword = this.onChangeSignInPassword.bind(this);

    this.onChangeSignUpEmail = this.onChangeSignUpEmail.bind(this);
    this.onChangeSignUpPassword = this.onChangeSignUpPassword.bind(this);
    this.onChangeSignUpFirstName = this.onChangeSignUpFirstName.bind(this);
    this.onChangeSignUpLastName = this.onChangeSignUpLastName.bind(this);

    this.onSignUp = this.onSignUp.bind(this);
    this.onSignIn = this.onSignIn.bind(this);
    this.logout = this.logout.bind(this);

    this.loadOut = this.loadOut.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.agregarTarea = this.agregarTarea.bind(this);
  }

  agregarTarea(e) {
    if (this.state._id) {
      // implemento fetch del navegador en lugar de axios
      fetch(`/api/tareas/${this.state._id}`, {
        method: "PUT",
        body: JSON.stringify(this.state),
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      })
        .then(res => res.json())
        .then(data => {
          M.toast({ html: "Tarea actualizada" });
          this.setState({ title: "", description: "", _id: "", priority: "", date: moment().format('YYYY-MM-DD') });
          this.fetchTasks();
        });
    } else {
      // implemento fetch del navegador en lugar de axios
      fetch("/api/tareas", {
        method: "POST",
        body: JSON.stringify(this.state),
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      })
        .then(res => res.json())
        .then(data => {
          M.toast({ html: "Tarea guardada" });
          this.setState({ title: "", description: "", priority: "", date: moment().format('YYYY-MM-DD') });
          this.fetchTasks();
        })
        .catch(err => console.log(err));
    }
    e.preventDefault();
  }

  componentDidMount() {
    this.fetchTasks();
    const obj = getFromStorage("the_main_app");
    if (obj && obj.token) {
      const { token } = obj;
      // Verificar token
      fetch("/api/cuenta/verificar?token=" + token)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            this.setState({
              token,
              isLoading: false
            });
          } else {
            this.setState({
              isLoading: false
            });
          }
        });
    } else {
      this.setState({
        isLoading: false
      });
    }
  }

  fetchTasks() {
    // implemento fetch del navegador en lugar de axios
    fetch("/api/tareas")
      .then(res => res.json())
      .then(data => {
        this.setState({ tasks: data })
      });
  }

  editarTarea(id) {
    // implemento fetch del navegador en lugar de axios
    fetch(`/api/tarea/${id}`)
      .then(res => res.json())
      .then(data => {
        this.setState({
          title: data.title,
          description: data.description,
          priority: data.priority,
          date: data.date,
          _id: data._id
        });
      });
  }

  eliminarTarea(id) {
    if (confirm("¿Estás seguro de eliminar esta tarea?")) {
      // implemento fetch del navegador en lugar de axios
      fetch(`/api/tarea/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      })
        .then(res => res.json())
        .then(data => {
          M.toast({ html: "Tarea eliminada" });
          this.fetchTasks();
        });
    }
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  }

  // Toma valores de Iniciar Sesión
  onChangeSignInEmail(event) {
    this.setState({
      signInEmail: event.target.value
    });
  }
  onChangeSignInPassword(event) {
    this.setState({
      signInPassword: event.target.value
    });
  }

  // Toma valores de Registrarse
  onChangeSignUpEmail(event) {
    this.setState({
      signUpEmail: event.target.value
    });
  }
  onChangeSignUpPassword(event) {
    this.setState({
      signUpPassword: event.target.value
    });
  }
  onChangeSignUpFirstName(event) {
    this.setState({
      signUpFirstName: event.target.value
    });
  }
  onChangeSignUpLastName(event) {
    this.setState({
      signUpLastName: event.target.value
    });
  }

  // Para evento onClick
  onSignIn() {
    //Tomar estado
    const {
      signInEmail,
      signInPassword
    } = this.state;

    this.setState({
      isLoading: true
    });
    //Petición post al backend
    fetch("/api/cuenta/iniciarsesion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: signInEmail,
        password: signInPassword
      }),
    }).then(res => res.json())
      .then(json => {
        if (json.success) {
          setInStorage("the_main_app", { token: json.token });
          this.setState({
            signInError: json.message,
            isLoading: false,
            signInEmail: "",
            signInPassword: "",
            token: json.token
          });
        } else {
          this.setState({
            signInError: json.message,
            isLoading: false
          });
        }
      });
  }

  onSignUp() {
    //Tomar estado
    const {
      signUpFirstName,
      signUpLastName,
      signUpEmail,
      signUpPassword
    } = this.state;

    this.setState({
      isLoading: true
    });

    //Petición post al backend
    fetch("/api/cuenta/registrarse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstName: signUpFirstName,
        lastName: signUpLastName,
        email: signUpEmail,
        password: signUpPassword
      }),
    }).then(res => res.json())
      .then(json => {
        if (json.success) {
          this.setState({
            signUpError: json.message,
            isLoading: false,
            signUpFirstName: "",
            signUpLastName: "",
            signUpEmail: "",
            signUpPassword: ""
          });
        } else {
          this.setState({
            signUpError: json.message,
            isLoading: false
          });
        }
      });
  }

  loadOut(){
    this.setState({
      isLoading: false
    });
  }

  logout() {
    this.setState({
      isLoading: true
    })

    const obj = getFromStorage("the_main_app");
    if (obj && obj.token) {
      const { token } = obj;
      // Verificar token
      fetch("/api/cuenta/salir?token=" + token)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            this.setState({
              token: "",
              isLoading: false
            });
          } else {
            this.setState({
              isLoading: false
            });
          }
        });
    } else {
      this.setState({
        isLoading: false
      });
    }
  }

  render() {
    const {
      isLoading,
      token,
      signInError,
      signInEmail,
      signInPassword,
      signUpFirstName,
      signUpLastName,
      signUpEmail,
      signUpPassword,
      signUpError
    } = this.state;
    if (isLoading) {
      return (
        <div>
          <p>Cargando...</p>
          <button
          className="btn waves-effect waves-light grey darken-1"
          type="submit"
          onClick={this.loadOut}>Salir
                      <i className="material-icons right">exit_to_app</i>
        </button>
        </div>
      );
    }
    if (!token) {
      return (
        <div>
          <div className="row">
            <div className="row">
              <div className="card grey darken-2">
                <div className="card-content white-text">
                  {
                    (signInError) ? (
                      <p>{signInError}</p>
                    ) : (null)
                  }
                  <span className="card-title">Iniciar Sesión</span>
                  <div className="input-field col s6">
                    <input
                      type="email"
                      id="email-signin"
                      value={signInEmail}
                      onChange={this.onChangeSignInEmail}
                    />
                    <label htmlFor="email-signin">Correo</label>
                  </div>
                  <div className="input-field col s6">
                    <input
                      type="password"
                      id="password-signin"
                      value={signInPassword}
                      onChange={this.onChangeSignInPassword}
                    />
                    <label htmlFor="password-signin">Contraseña</label>
                  </div>
                  <button
                    className="btn waves-effect waves-light grey darken-1"
                    type="submit"
                    onClick={this.onSignIn}>Iniciar Sesión
                      <i className="material-icons right">send</i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <br />
          <div className="row">
            <div className="row">
              <div className="card grey darken-2">
                <div className="card-content white-text">
                  {
                    (signUpError) ? (
                      <p>{signUpError}</p>
                    ) : (null)
                  }
                  <span className="card-title">Registrarse</span>
                  <div className="input-field col s6">
                    <input
                      type="text"
                      id="name"
                      value={signUpFirstName}
                      onChange={this.onChangeSignUpFirstName}
                    />
                    <label htmlFor="name">Nombre</label>
                  </div>
                  <div className="input-field col s6">
                    <input
                      type="text"
                      id="last_name"
                      value={signUpLastName}
                      onChange={this.onChangeSignUpLastName}
                    />
                    <label htmlFor="last_name">Apellido</label>
                  </div>
                  <div className="input-field col s6">
                    <input
                      type="email"
                      id="email-signup"
                      value={signUpEmail}
                      onChange={this.onChangeSignUpEmail}
                    />
                    <label htmlFor="email-signup">Correo</label>
                  </div>
                  <div className="input-field col s6">
                    <input
                      type="password"
                      id="password-signup"
                      value={signUpPassword}
                      onChange={this.onChangeSignUpPassword}
                    />
                    <label htmlFor="password-signup">Contraseña</label>
                  </div>
                  <button
                    className="btn waves-effect waves-light grey darken-1"
                    type="submit"
                    onClick={this.onSignUp}>Registrarme
                      <i className="material-icons right">send</i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      );
    }
    return (
      <div>
        <p>Bienvenido </p>
        <div>
          <nav className="teal darken-4">
            <div className="container">
              <a className="brand-logo" href="/">Gestor de Tareas</a>
            </div>
          </nav>
          <div className="container">
            <div className="row">
              <div className="col s5">
                <div className="card">
                  <div className="card-content">
                    <form onSubmit={this.agregarTarea}>
                      <div className="row">
                        <div className="input-field col s12">
                          <input
                            name="title"
                            onChange={this.handleChange}
                            type="text"
                            placeholder="Título de tarea"
                            value={this.state.title} />
                        </div>
                      </div>
                      <div className="row">
                        <div className="input-field col s12">
                          <textarea
                            name="description"
                            onChange={this.handleChange}
                            placeholder="Descripción de la tarea"
                            className="materialize-textarea"
                            value={this.state.description} >
                          </textarea>
                        </div>
                      </div>
                      <div className="row">
                        <div className="input-field col s12">
                          <input
                            name="date"
                            type="date"
                            onChange={this.handleChange}
                            className="datepicker"
                            value={moment(this.state.date).format('YYYY-MM-DD')} />
                          <label >Fecha de vencimiento</label>
                        </div>
                      </div>
                      <div className="row">
                        <label >Nivel de prioridad</label>
                        <p>
                          <label>
                            <input
                              name="priority"
                              onChange={this.handleChange}
                              type="radio"
                              value={this.state.priority + "Alta"} />
                            <span>Prioridad Alta</span>
                          </label>
                        </p>
                        <p>
                          <label>
                            <input
                              name="priority"
                              onChange={this.handleChange}
                              type="radio"
                              value={this.state.priority + "Media"} />
                            <span>Prioridad Media</span>
                          </label>
                        </p>
                        <p>
                          <label>
                            <input
                              name="priority"
                              onChange={this.handleChange}
                              type="radio"
                              value={this.state.priority + "Baja"} />
                            <span>Prioridad Baja</span>
                          </label>
                        </p>
                      </div>
                      <button type="submit" className="btn teal darken-1">Enviar</button>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col s7">
                <table>
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Descripción</th>
                      <th>Prioridad</th>
                      <th>Fecha de vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.state.tasks.map(task => {
                        return (
                          <tr key={task._id}>
                            <td>{task.title}</td>
                            <td>{task.description}</td>
                            <td>{task.priority}</td>
                            <td>{task.date}</td>
                            <td>
                              <button className="btn lime darken-1" onClick={() => this.editarTarea(task._id)}><i className="material-icons" >edit</i></button>
                              <button className="btn red darken-4" style={{ margin: '5px' }} onClick={() => this.eliminarTarea(task._id)} ><i className="material-icons">delete</i></button>
                            </td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <button
          className="btn waves-effect waves-light grey darken-1"
          type="submit"
          onClick={this.logout}>Salir
                      <i className="material-icons right">exit_to_app</i>
        </button>
      </div>
    );
  }
}

export default Home;
