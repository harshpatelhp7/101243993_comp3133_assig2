import { Component } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'week12_angular_apollo_graphql';
  listing_data = {};

  private GET_LISTINGS = gql`
    {
      listings {
        listing_title
        city
        description
      }
    }
  `;

  constructor(private apolloClient: Apollo) {
    this.getListings();
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
