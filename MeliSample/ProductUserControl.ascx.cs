
using System;
using System.Web;
using System.Web.UI;
using System.Collections.Generic;

namespace MeliSample
{
	public partial class ProductUserControl : System.Web.UI.UserControl
	{

		public List<Currency> ListCurrency { get; set; }

		public List<Product> SearchItems { get; set; }
	
		public int Results { get; set; }

		public ProductUserControl ()
		{
			SearchItems = new List<Product>();
			ListCurrency = new List<Currency>();
		}

		public string TransformDate(string date)
		{
			DateTime dt = DateTime.Parse(date);
			return dt.ToString("dd/MM/yy");
		}

		public string TransformCurrency(string id)
		{
			string symbol = "";
			foreach (Currency item in ListCurrency) {

				if(item.id == id)
					return item.symbol;
			}
			return symbol;
		}

	}
}

