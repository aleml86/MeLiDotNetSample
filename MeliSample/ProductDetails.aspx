<%@ Page Language="C#" Inherits="MeliSample.ProductDetails" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html>
<head runat="server">
	<title>ProductDetails</title>

	<link rel="stylesheet" href="/css/chico-mesh.css" />
	<link rel="stylesheet" href="/css/chico-0.12.2.css" />
	
	<script src="http://code.jquery.com/jquery-1.8.3.js"></script>
	<script src="/js/jquery.js"></script>
	<script src="/js/chico-0.12.2.js"></script>

<style>

.ch-carousel-content li {
	width: 120px;
	height: 120px;
}

</style>

<script>

 $(window).load(function() {
 	 var foo = $("#example").carousel(); 
 });

</script>

</head>
<body>



	<h1> <%= Item.title %> </h1>
	
	<form id="form1" runat="server">
	
		<!--<asp:DataGrid id="grid" runat="server" AutoGenerateColumns="true" />-->
		
		<div class="ch-g2-3">
			<div class="ch-box ch-leftcolumn">	
				<!-- pictures -->
				<div id="example" class="ch-carousel">
			
					<ul>
						<asp:Repeater ID="customersRepeater" runat="server">
							<ItemTemplate>
						    <li>
						    	<img src ="<%# Eval("url") %>" />
						    </li>
						    </ItemTemplate>
						</asp:Repeater>
					</ul>
				
				</div>
			</div>
		</div>

		
		<div class="ch-g1-3">
			<div class="ch-box ch-rightcolumn">
				
				
				<% string curr = TransformCurrency(Item.currency_id); %>  
				<p><strong class="ch-price"> <%= curr %>  <%=  Item.price %></strong></p>
				
				<p>Condition: <%= Item.condition %> </p>	
				
				<h3><%= Item.subtitle %></h3>
		
				<p><%= Item.initial_quantity %> / <%= Item.available_quantity %>  / <%= Item.sold_quantity %> </p>
				<p><%= Item.location %> </p>
								
				<h1> Seller Reputation </h1>
				<h1> Shipping Methods</h1>
				<h1> Payments Methods</h1>
				
		
			</div>
		</div>
	
		
	</form>
	
			
</body>
</html>
<!--
		----public string subtitle { get; set; }
		public int seller_id { get; set; }
		public string category_id { get; set; }
		---- public int price { get; set; }
		public int base_price { get; set; }
		----public string currency_id { get; set; }
		----public int initial_quantity { get; set; }
		----public int available_quantity { get; set; }
		----public int sold_quantity { get; set; }
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
		
-->