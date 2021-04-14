import { Product } from './models/Product';
import { Listing } from './models/Listing';

let product1 = new Product(
    1,
    "Lumber",
    "The best lumber ever from the rainforest.",
    "https://via.placeholder.com/300",
)

let product2 = new Product(
    2,
    "Metal",
    "Steel silver metal",
    "https://via.placeholder.com/300",
)

let product3 = new Product(
    3,
    "Tile",
    "blue tile",
    "https://via.placeholder.com/300",
)


let listings = [new Listing(
    product1,
    "Auction",
    1,
    "1-1-2021",
    "1-3-2021",
    7.99,
    "",
    "",
    "",
    ""
),
new Listing(
    product2,
    "Fixed",
    2,
    "",
    "",
    "",
    "1-2-2021",
    "5.99",
    "7.99",
    ""
),
new Listing(
    product3,
    "Bulk",
    3,
    "",
    "",
    "",
    "1-2-2021",
    "5.99",
    "7.99",
    "6"
)]