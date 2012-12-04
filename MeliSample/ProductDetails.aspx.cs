
using System;
using System.Web;
using System.Web.UI;
using System.Collections.Generic;


namespace MeliSample
{
	public partial class ProductDetails : System.Web.UI.Page
	{
		private MeliService ms;

		public ItemObject Item { get; set; }

		protected void Page_Load(object sender, EventArgs e)
		{
			ms = MeliService.GetService ();

			string product = Request ["productID"].ToString ();

			this.Item = ms.GetProduct(product);

			this.customersRepeater.DataSource = Item.pictures;

			this.customersRepeater.DataBind();

		}
	
		public string TransformCurrency(string currency_id)
		{
			string symbol = "";
			foreach (Currency item in ms.GetCurrency()) 
			{
				if(item.id == currency_id)
					return item.symbol;
			}
			return symbol;
		}

	}
}

