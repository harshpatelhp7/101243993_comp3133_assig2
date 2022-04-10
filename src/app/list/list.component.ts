import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit {
  user: any;
  listing_data = {};
  userID: any;

  private GET_LISTINGS = gql`
    {
      listings {
        listing_title
        city
        description
      }
    }
  `;
  private GET_USER_INFO = gql`
    query getUser($userId: ID!) {
      getUser(userId: $userId) {
        username
        firstname
        lastname
        email
        createdListings {
          listing_title
        }
      }
    }
  `;
  constructor(private route: ActivatedRoute, private apolloClient: Apollo) {
    this.getListings();
  }
  ngOnInit(): void {
    this.userID = this.route.snapshot.paramMap.get('user');

    this.apolloClient
      .watchQuery({
        query: this.GET_USER_INFO,
        variables: { userId: this.userID },
      })
      .valueChanges.subscribe((res) => {
        this.user = res.data;
        console.log(this.user);
      });
  }

  getListings() {
    this.apolloClient
      .watchQuery({ query: this.GET_LISTINGS })
      .valueChanges.subscribe((response) => {
        this.listing_data = response.data as object;
        console.log(this.listing_data);
      });
  }
}
