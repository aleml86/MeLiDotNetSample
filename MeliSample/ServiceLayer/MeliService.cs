using System;
using RestSharp;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using MercadoLibre.SDK;

namespace MeliSample
{
	public class MeliService
	{
		public Meli service { get; set; }

		private static MeliService meliService;

		public static MeliService GetService ()
		{
			if (meliService == null) 
			{
				meliService = new MeliService();
			}
			return meliService;
		}

		private MeliService ()
		{
			service = new Meli(app_id,"api_key");
		}

		public List<Sites> GetSites ()
		{
			IRestResponse results = service.Get ("sites");
			return JsonConvert.DeserializeObject<List<Sites>>(results.Content);
		}

		public List<Categories> GetCatergories (string site)
		{
			string resource = "sites/" + site + "/categories";
			IRestResponse results = service.Get (resource);
			return JsonConvert.DeserializeObject<List<Categories>>(results.Content);
		}

		public ItemObject GetProduct (string product)
		{
			string resource = "/items/" + product;
			IRestResponse result = service.Get(resource);
			return JsonConvert.DeserializeObject<ItemObject>(result.Content);
		}

		public List<Currency> GetCurrency ()
		{
			string resource = "currencies";
			IRestResponse results = service.Get (resource);
			return JsonConvert.DeserializeObject<List<Currency>>(results.Content);
		}

		public UserObject GetUserInfo ()
		{
			IRestResponse results = service.Get("users/me?access_token=" + service.AccessToken );
			return JsonConvert.DeserializeObject<UserObject>(results.Content);
		}

		public List<Product> Search(string toSearch, string site ="MLA", string cat = "")
		{
			string resource = "sites/" + site + "/search?category=" + cat + "&q= " + toSearch.Trim(); 
			IRestResponse result = service.Get(resource);
			return JsonConvert.DeserializeObject<List<Product>>(JObject.Parse(result.Content)["results"].ToString());
		}

		public string Authorize ()
		{
			return service.GetAuthUrl("http://127.0.0.1:8080/Response.aspx");
		}

		public void Authenticate (string code)
		{
			string url = "http://127.0.0.1:8080/Response.aspx";
			service.Authorize(code, url);
		}
	}

	#region Currency

	public class Currency
	{
		public string id { get; set; }
		public string description { get; set; }
		public string symbol { get; set; }
		public int decimal_places { get; set; }
	}

	#endregion

	#region Category

	public class Categories
	{
		public string id { get; set; }
		public string name { get; set; }
	}

	#endregion

	#region Site

	public class Sites
	{
		public string id { get; set; }
		public string name { get; set; }

		public override string ToString ()
		{
			return name;
		}
	}

	#endregion

	#region Product

	public class Seller
	{
		public int id { get; set; }
		public object power_seller_status { get; set; }
		public bool car_dealer { get; set; }
		public bool real_estate_agency { get; set; }
	}
	
	public class Installments
	{
		public int quantity { get; set; }
		public double amount { get; set; }
		public string currency_id { get; set; }
	}
	
	public class Address
	{
		public string state_id { get; set; }
		public string state_name { get; set; }
		public string city_id { get; set; }
		public string city_name { get; set; }
	}
	
	public class Country
	{
		public string id { get; set; }
		public string name { get; set; }
	}
	
	public class State
	{
		public string id { get; set; }
		public string name { get; set; }
	}
	
	public class City
	{
		public string id { get; set; }
		public string name { get; set; }
	}
	
	public class SellerAddress
	{
		public int id { get; set; }
		public string comment { get; set; }
		public string address_line { get; set; }
		public string zip_code { get; set; }
		public Country country { get; set; }
		public State state { get; set; }
		public City city { get; set; }
		public string latitude { get; set; }
		public string longitude { get; set; }
	}
	
	public class Product
	{
		public string id { get; set; }
		public string site_id { get; set; }
		public string title { get; set; }
		public string subtitle { get; set; }
		public Seller seller { get; set; }
		public double price { get; set; }
		public string currency_id { get; set; }
		public int sold_quantity { get; set; }
		public string buying_mode { get; set; }
		public string listing_type_id { get; set; }
		public string stop_time { get; set; }
		public string condition { get; set; }
		public string permalink { get; set; }
		public string thumbnail { get; set; }
		public bool accepts_mercadopago { get; set; }
		public Installments installments { get; set; }
		public Address address { get; set; }
		public SellerAddress seller_address { get; set; }
		public List<object> attributes { get; set; }

	    public override string ToString ()
		{
			return string.Format ("[RootObject: id={0}, site_id={1}, title={2}, subtitle={3}]", id, site_id, title, subtitle);
		}
	}

	#endregion

	#region User

	public class Identification
	{
		public string type { get; set; }
		public object number { get; set; }
	}
	
	public class Phone
	{
		public string area_code { get; set; }
		public string number { get; set; }
		public string extension { get; set; }
		public bool verified { get; set; }
	}
	
	public class AlternativePhone
	{
		public string area_code { get; set; }
		public string number { get; set; }
		public string extension { get; set; }
	}
	
	public class Ratings
	{
		public int positive { get; set; }
		public int negative { get; set; }
		public int neutral { get; set; }
	}
	
	public class Transactions
	{
		public string period { get; set; }
		public int total { get; set; }
		public int completed { get; set; }
		public int canceled { get; set; }
		public Ratings ratings { get; set; }
	}
	
	public class SellerReputation
	{
		public object level_id { get; set; }
		public object power_seller_status { get; set; }
		public Transactions transactions { get; set; }
	}
	
	public class Canceled
	{
		public object total { get; set; }
		public object paid { get; set; }
	}
	
	public class Unrated
	{
		public object total { get; set; }
		public object paid { get; set; }
	}
	
	public class NotYetRated
	{
		public object total { get; set; }
		public object paid { get; set; }
		public object units { get; set; }
	}
	
	public class Transactions2
	{
		public string period { get; set; }
		public object total { get; set; }
		public object completed { get; set; }
		public Canceled canceled { get; set; }
		public Unrated unrated { get; set; }
		public NotYetRated not_yet_rated { get; set; }
	}
	
	public class BuyerReputation
	{
		public int canceled_transactions { get; set; }
		public Transactions2 transactions { get; set; }
	}
	
	public class ImmediatePayment
	{
		public bool required { get; set; }
		public List<object> reasons { get; set; }
	}
	
	public class List
	{
		public bool allow { get; set; }
		public List<string> codes { get; set; }
		public ImmediatePayment immediate_payment { get; set; }
	}
	
	public class ImmediatePayment2
	{
		public bool required { get; set; }
		public List<object> reasons { get; set; }
	}
	
	public class Buy
	{
		public bool allow { get; set; }
		public List<object> codes { get; set; }
		public ImmediatePayment2 immediate_payment { get; set; }
	}
	
	public class ImmediatePayment3
	{
		public bool required { get; set; }
		public List<object> reasons { get; set; }
	}
	
	public class Sell
	{
		public bool allow { get; set; }
		public List<object> codes { get; set; }
		public ImmediatePayment3 immediate_payment { get; set; }
	}
	
	public class Billing
	{
		public bool allow { get; set; }
		public List<string> codes { get; set; }
	}
	
	public class Status
	{
		public string site_status { get; set; }
		public List list { get; set; }
		public Buy buy { get; set; }
		public Sell sell { get; set; }
		public Billing billing { get; set; }
		public bool mercadopago_tc_accepted { get; set; }
		public string mercadopago_account_type { get; set; }
		public string mercadoenvios { get; set; }
		public bool immediate_payment { get; set; }
	}
	
	public class Credit
	{
		public int consumed { get; set; }
		public string credit_level_id { get; set; }
	}
	
	public class UserObject
	{
		public int id { get; set; }
		public string nickname { get; set; }
		public string registration_date { get; set; }
		public string first_name { get; set; }
		public string last_name { get; set; }
		public string country_id { get; set; }
		public string email { get; set; }
		public Identification identification { get; set; }
		public Phone phone { get; set; }
		public AlternativePhone alternative_phone { get; set; }
		public string user_type { get; set; }
		public List<string> tags { get; set; }
		public object logo { get; set; }
		public int points { get; set; }
		public string site_id { get; set; }
		public string permalink { get; set; }
		public List<string> shipping_modes { get; set; }
		public object seller_experience { get; set; }
		public SellerReputation seller_reputation { get; set; }
		public BuyerReputation buyer_reputation { get; set; }
		public Status status { get; set; }
		public Credit credit { get; set; }
	}

	#endregion

	public class Picture
	{
		public string id { get; set; }
		public string url { get; set; }
		public string secure_url { get; set; }
		public string size { get; set; }
		public string max_size { get; set; }
		public string quality { get; set; }
	}
	
	public class Description
	{
		public string id { get; set; }
	}
	
	public class Shipping
	{
		public object profile_id { get; set; }
		public string mode { get; set; }
		public bool local_pick_up { get; set; }
		public bool free_shipping { get; set; }
		public List<object> methods { get; set; }
		public object dimensions { get; set; }
	}

	public class Geolocation
	{
		public string latitude { get; set; }
		public string longitude { get; set; }
	}
	
	public class ItemObject
	{
		public string id { get; set; }
		public string site_id { get; set; }
		public string title { get; set; }
		public string subtitle { get; set; }
		public int seller_id { get; set; }
		public string category_id { get; set; }
		public int price { get; set; }
		public int base_price { get; set; }
		public string currency_id { get; set; }
		public int initial_quantity { get; set; }
		public int available_quantity { get; set; }
		public int sold_quantity { get; set; }
		public string buying_mode { get; set; }
		public string listing_type_id { get; set; }
		public string start_time { get; set; }
		public string stop_time { get; set; }
		public string condition { get; set; }
		public string permalink { get; set; }
		public string thumbnail { get; set; }
		public List<Picture> pictures { get; set; }
		public object video_id { get; set; }
		public List<Description> descriptions { get; set; }
		public bool accepts_mercadopago { get; set; }
		public List<object> non_mercado_pago_payment_methods { get; set; }
		public Shipping shipping { get; set; }
		public SellerAddress seller_address { get; set; }
		public object seller_contact { get; set; }
		public object location { get; set; }
		public Geolocation geolocation { get; set; }
		public List<object> coverage_areas { get; set; }
		public List<object> attributes { get; set; }
		public List<object> variations { get; set; }
		public string status { get; set; }
		public List<object> sub_status { get; set; }
		public List<object> tags { get; set; }
		public string warranty { get; set; }
		public object catalog_product_id { get; set; }
		public string parent_item_id { get; set; }
		public string date_created { get; set; }
		public string last_updated { get; set; }
	}
}

