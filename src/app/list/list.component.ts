import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { Router } from '@angular/router';
import { Listing } from '../models/listing';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit {
  user: any;
  listing_data: any;
  userID: any;
  displayBookinInput = false;
  displayLists = true;
  listingIdToBeBooked: any;
  booking_start = new FormControl();
  booking_end = new FormControl();
  showAddListing = false;
  displayBookedListingComp = false;
  newListing!: Listing;
  bookedListings: any;
  displayYourListings = false;
  type: boolean | undefined;

  private GET_LISTINGS = gql`
    {
      listings {
        _id
        listing_title
        city
        description
        price
        email
      }
    }
  `;

  private GET_BOOKINGS = gql`
    {
      bookings {
        _id
        listing_id {
          listing_title
          price
        }
        booking_start
        booking_end
        username {
          username
          firstname
          email
        }
      }
    }
  `;

  private CREATE_LISTING = gql`
    mutation createListing($listingInput: ListingInput) {
      createListing(listingInput: $listingInput) {
        _id
        listing_title
        username {
          username
        }
      }
    }
  `;

  private GET_USER_INFO = gql`
    query getUser($userId: ID!) {
      getUser(userId: $userId) {
        _id
        username
        firstname
        lastname
        email
        type
        createdListings {
          listing_title
          city
          description
          price
          email
        }
      }
    }
  `;

  private BOOK_LISTING = gql`
    mutation bookListing($bookingInput: BookingInput) {
      bookListing(bookingInput: $bookingInput) {
        listing_id {
          listing_title
        }
        booking_date
        booking_start
        booking_end
      }
    }
  `;

  constructor(
    private route: ActivatedRoute,
    private apolloClient: Apollo,
    private router: Router
  ) {
    this.getListings();
    this.newListing = {
      listing_title: '',
      description: '',
      street: '',
      city: '',
      postal_code: '',
      price: null,
      email: '',
      username: `${this.route.snapshot.paramMap.get('user')}`,
    };
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
        if (this.user['getUser'].type === 'admin') {
          this.type = true;
        } else {
          this.type = false;
        }
        console.log(this.user);
      });

    this.apolloClient
      .watchQuery({
        query: this.GET_BOOKINGS,
      })
      .valueChanges.subscribe((res) => {
        console.log(res.data);
        this.bookedListings = res.data as object;
      });
  }

  getListings() {
    this.apolloClient
      .watchQuery({
        query: this.GET_LISTINGS,
      })
      .valueChanges.subscribe((response) => {
        this.listing_data = response.data as object;
      });
  }

  bookListing(listingId: any) {
    this.displayBookinInput = true;
    this.displayLists = false;
    this.listingIdToBeBooked = listingId;
    console.log(this.listingIdToBeBooked);
    // this.apolloClient
    //   .mutate({
    //     mutation: this.BOOK_LISTING,
    //     variables: {
    //       bookingInput: {
    //         listing_id: listingId,
    //         username: this.user['getUser']._id,
    //         booking_start: '2022-04-10T00:28:01.586Z',
    //         booking_end: '2022-04-10T00:28:28.394Z',
    //       },
    //     },
    //   })
    //   .subscribe((res) => {
    //     console.log(res);
    //   });
    // setTimeout(() => {}, 3000);
    // window.alert('Listing Booked');
  }

  bookListingInReal() {
    this.apolloClient
      .mutate({
        mutation: this.BOOK_LISTING,
        variables: {
          bookingInput: {
            listing_id: this.listingIdToBeBooked,
            username: this.user['getUser']._id,
            booking_start: this.booking_start.value,
            booking_end: this.booking_end.value,
          },
        },
      })
      .subscribe((res) => {
        console.log(res);
      });
    setTimeout(() => {}, 3000);
    window.alert('Listing Booked');
    this.displayBookinInput = false;
    this.displayLists = true;
  }

  createListingForAdmins() {
    if (this.user['getUser'].type == 'admin') {
      this.showAddListing = true;
      this.displayBookinInput = false;
      this.displayLists = false;
    } else {
      window.alert('Oops. Admin Feature Only');
    }
  }

  showYourListings() {
    this.displayYourListings = true;
    this.displayLists = false;
  }

  refresh() {
    this.apolloClient
      .watchQuery({
        query: this.GET_LISTINGS,
        fetchPolicy: 'cache-and-network',
      })
      .valueChanges.subscribe((response) => {
        this.listing_data = response.data as object;
      });
    this.apolloClient
      .watchQuery({
        query: this.GET_BOOKINGS,
        fetchPolicy: 'cache-and-network',
      })
      .valueChanges.subscribe((res) => {
        console.log(res.data);
        this.bookedListings = res.data as object;
      });

    this.apolloClient
      .watchQuery({
        query: this.GET_USER_INFO,
        fetchPolicy: 'cache-and-network',
        variables: { userId: this.userID },
      })
      .valueChanges.subscribe((res) => {
        this.user = res.data;
        if (this.user['getUser'].type === 'admin') {
          this.type = true;
        } else {
          this.type = false;
        }
        console.log(this.user);
      });
  }

  onSubmitListingForm() {
    try {
      this.apolloClient
        .mutate({
          mutation: this.CREATE_LISTING,
          variables: {
            listingInput: this.newListing,
          },
        })
        .subscribe((res) => {
          console.log(res);
        });
      window.alert('New Listing Added');

      this.showAddListing = false;
      this.displayLists = true;
    } catch (err) {
      window.alert('something went wrong. Try again');
    }
  }

  showBookings() {
    this.displayBookedListingComp = true;
    this.displayLists = false;
  }

  goBack() {
    this.displayBookinInput = false;
    this.displayLists = true;
    this.showAddListing = false;
    this.displayBookedListingComp = false;
    this.displayYourListings = false;
  }

  logout() {
    this.router.navigate(['']);
  }
}
