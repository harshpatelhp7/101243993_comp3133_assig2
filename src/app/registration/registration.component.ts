import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { User } from '../models/user';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {
  title = 'Property & Listings Website';

  user!: User;
  displayLogin = false;
  displayReg = true;
  existuser = {
    username: '',
    password: '',
    type: 'customer',
  };
  loggedUser: any;
  value: any;

  private CREATE_USER = gql`
    mutation createUser($userInput: UserInput) {
      createUser(userInput: $userInput) {
        username
      }
    }
  `;

  private GET_USER = gql`
    query login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        userId
        token
        tokenExpiration
      }
    }
  `;

  constructor(private apolloClient: Apollo, private router: Router) {
    this.user = {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      username: '',
      type: 'customer',
    };
  }

  onSubmitForm(userData: any) {
    try {
      this.apolloClient
        .mutate({
          mutation: this.CREATE_USER,
          variables: {
            userInput: this.user,
          },
        })
        .subscribe((res) => {
          this.displayLogin = true;
          this.displayReg = false;
        });
    } catch (error) {
      window.alert(error);
    }
  }

  onSubmitLoginForm(userData: any) {
    try {
      this.apolloClient
        .watchQuery({
          query: this.GET_USER,
          variables: {
            username: this.existuser.username,
            password: this.existuser.password,
          },
        })
        .valueChanges.subscribe((res) => {
          this.loggedUser = res.data;

          this.router.navigate([`/list/${this.loggedUser['login'].userId}`]);
        });
    } catch (err) {
      throw err;
    }
  }

  showLogin() {
    this.displayLogin = true;
    this.displayReg = false;
  }

  showReg() {
    this.displayLogin = false;
    this.displayReg = true;
  }

  ngOnInit(): void {}
}
