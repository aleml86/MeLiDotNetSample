
using System;
using System.Web;
using System.Web.UI;
using System.Collections.Generic;

namespace MeliSample
{
	public partial class Default : System.Web.UI.Page
	{

		private MeliService ms;

		private List<Sites> sites;

		private void populateDropDownListSites ()
		{
			DDLsites.Items.Clear();
			DDLsites.DataSource = sites;
			DDLsites.DataBind();

			populateDropDownListCategories();
		}

		private void populateDropDownListCategories ()
		{
			DDLcategories.Items.Clear();
			DDLcategories.DataSource = ms.GetCatergories(DDLsites.SelectedItem.Value);
			DDLcategories.DataBind();
		}

		public virtual void updateCategories (object sender, EventArgs e)
		{
			populateDropDownListCategories();
		}

		protected override void OnLoad (EventArgs e)
		{
			base.OnLoad (e);
		
			ms = MeliService.GetService();
			sites = ms.GetSites();

			if (!IsPostBack) 
			{
				populateDropDownListSites();
			}
		}

		public virtual void btnSearchClicked (object sender, EventArgs args)
		{
			ProductUserControl productUserControl = (ProductUserControl)LoadControl("~/ProductUserControl.ascx");
			productUserControl.ListCurrency = ms.GetCurrency();
			productUserControl.SearchItems = ms.Search(textInput.Text, DDLsites.SelectedItem.Value,DDLcategories.SelectedItem.Value);
			resultsPlaceHolder.Controls.Add(productUserControl);
		}

		public virtual void btnAccessClicked (object sender, EventArgs args)
		{
			string redirectUrl = ms.Authorize();
			Response.Redirect(redirectUrl);
		}

		public virtual void btnLogoutClicked (object sender, EventArgs args)
		{
			Session.Abandon();
			Session.Clear();
			Response.Redirect("~/Default.aspx");
		}

	}
}

